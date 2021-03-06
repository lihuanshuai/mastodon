# frozen_string_literal: true

class Auth::OmniauthCallbacksController < Devise::OmniauthCallbacksController
  include Devise::Controllers::Rememberable
  include WithRedisSessionStore
  include Localized

  def pixiv
    data = request.env['omniauth.auth']

    if signed_in?(:user)
      oauth_authentication = current_user.oauth_authentications.find_or_initialize_by(
        provider: data[:provider],
        uid: data[:uid]
      )

      if oauth_authentication.persisted?
        if current_user.initial_password_usage
          if current_user.update(email: data['info']['email'])
            flash[:notice] = t('oauth_authentications.successfully_synchronization')
          else
            flash[:alert] = current_user.errors.full_messages.first
          end
        end
      elsif oauth_authentication.save
        enqueue_fetch_pixiv_follows_worker(oauth_authentication, data)
        flash[:notice] = t('oauth_authentications.successfully_linked')
      else
        flash[:alert] = oauth_authentication.errors.full_messages.first
      end

      redirect_to after_sign_in_path_for(current_user)
    else
      oauth_authentication = OauthAuthentication.find_by(provider: data.provider, uid: data.uid)

      if oauth_authentication
        user = oauth_authentication.user
        if user.otp_required_for_login?
          session[:otp_user_id] = user.id
          self.resource = user
          render 'auth/sessions/two_factor', layout: 'auth'
        else
          sign_in(user)
          remember_me(user)
          enqueue_fetch_pixiv_follows_worker(oauth_authentication, data)

          redirect_to after_sign_in_path_for(user)
        end
      else
        store_omniauth_auth
        redirect_to new_user_oauth_registration_path
      end
    end
  end

  private

  def enqueue_fetch_pixiv_follows_worker(oauth_authentication, data)
    FetchPixivFollowsWorker.perform_async(
      oauth_authentication.id,
      *data['credentials'].values_at('token', 'refresh_token', 'expires_at')
    )
  end

  def store_omniauth_auth
    redis_session_store('devise.omniauth') do |redis|
      redis.setex('auth', 15.minutes, request.env['omniauth.auth'].to_json)
    end
  end
end
