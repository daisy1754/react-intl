import 'intl-pluralrules/polyfill';
import '@formatjs/intl-relativetimeformat/polyfill';
import '@formatjs/intl-relativetimeformat/dist/locale-data/nl';
import '@formatjs/intl-relativetimeformat/dist/locale-data/en';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {IntlProvider, FormattedMessage} from 'react-intl';

const App = () => (
  <h1>
    <FormattedMessage id="hello" /> <FormattedMessage id="world" />
  </h1>
);

class Root extends Component {
  state = {
    translations: {
      hello: 'hello',
      world: 'world'
    }
  }

  render() {
    let children;

    if (this.state.translations) {
      children = (
        <IntlProvider defaultLocale="nl" locale="nl" messages={this.state.translations}>
          <App />
        </IntlProvider>
      );
    }

    return <div>{children}</div>;
  }
}

ReactDOM.render(<Root />, document.getElementById('container'));
