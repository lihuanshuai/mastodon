object @account

attributes :id, :username, :acct, :display_name, :locked, :created_at

node(:note)                     { |account| Formatter.instance.simplified_format(account) }
node(:url)                      { |account| TagManager.instance.url_for(account) }
node(:avatar)                   { |account| full_asset_url(account.avatar_original_url) }
node(:avatar_static)            { |account| full_asset_url(account.avatar_static_url) }
node(:header)                   { |account| full_asset_url(account.header_original_url) }
node(:header_static)            { |account| full_asset_url(account.header_static_url) }
node(:media_statuses_count)     { |account| account.statuses.permitted_for(account, @current_account).joins(:media_attachments).distinct.count }

attributes :followers_count, :following_count, :statuses_count

child :oauth_authentications, object_root: false do
  attribute(:uid, :provider)
end
