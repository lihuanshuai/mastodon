import Immutable from 'immutable';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import ImmutablePropTypes from 'react-immutable-proptypes';
import IconButton from '../../../components/icon_button';

const storageKey = 'announcements_dismissed';

const Announcements = React.createClass({
  propTypes: {
    account: ImmutablePropTypes.map.isRequired,
  },

  mixins: [PureRenderMixin],

  getInitialState () {
    try {
      const dismissed = JSON.parse(localStorage.getItem(storageKey));
      return { dismissed: Array.isArray(dismissed) ? dismissed : [] };
    } catch (e) {
      return { dismissed: [] };
    }
  },

  componentDidUpdate (prevProps, prevState) {
    if (prevState.dismissed !== this.state.dismissed) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(this.state.dismissed));
      } catch (e) {}
    }
  },

  componentWillMount () {
    const announcements = [];
    if (this.props.account.get('oauth_authentications').findIndex((a) => a.get('provider') === 'pixiv') === -1) {
      announcements.push({
        id: 0,
        icon: '/announcements/icon_2x_360.png',
        body: 'pixivアカウント連携機能を追加しました！ユーザー設定から連携できます',
        link: { href: '/settings/oauth_authentications', body: 'ユーザー設定へ' }
      });
    }

    announcements.push(
      {
        id: 1,
        icon: '/announcements/icon_2x_360.png',
        body: 'PawooのiOS版アプリをリリースしました！！',
        link: { href: 'https://itunes.apple.com/us/app/%E3%83%9E%E3%82%B9%E3%83%88%E3%83%89%E3%83%B3%E3%82%A2%E3%83%97%E3%83%AA-pawoo/id1229070679?l=ja&ls=1&mt=8', body: 'Appストア へ' }
      }, {
        id: 2,
        icon: '/announcements/icon_2x_360.png',
        body: 'Android版アプリはこちらから！日々進化中～',
        link: { href: 'https://play.google.com/store/apps/details?id=jp.pxv.pawoo&hl=ja', body: 'Google Playストア へ' }
      }
    );

    this.announcements = Immutable.fromJS(announcements);
  },

  handleDismiss (event) {
    const id = +event.currentTarget.getAttribute('title');

    if (Number.isInteger(id)) {
      this.setState({ dismissed: [].concat(this.state.dismissed, id) });
    }
  },

  render () {
    return (
      <ul className='announcements'>
        {this.announcements.map(announcement => this.state.dismissed.indexOf(announcement.get('id')) === -1 && (
          <li key={announcement.get('id')}>
            <div className='announcements__icon'>
              <img src={announcement.get('icon')} alt='' />
            </div>
            <div className='announcements__body'>
              <div className='announcements__body__dismiss'>
                <IconButton icon='close' title={`${announcement.get('id')}`} onClick={this.handleDismiss} />
              </div>
              <p>{announcement.get('body')}</p>
              {announcement.get('link') &&
                <a href={announcement.getIn(['link', 'href'])} target='_blank'>
                  {announcement.getIn(['link', 'body'])}
                </a>
              }
            </div>
          </li>
        ))}
      </ul>
    );
  }
});

export default Announcements;