import * as React from 'react';
import * as HoistNonReactStatics from 'hoist-non-react-statics'
const hoistNonReactStatics: typeof HoistNonReactStatics = require('hoist-non-react-statics')
import {invariantIntlContext} from '../utils';
import {IntlShape, Omit} from '../types';

function getDisplayName(Component: React.ComponentType<any>) {
  return Component.displayName || Component.name || 'Component';
}

// TODO: We should provide initial value here
const IntlContext = React.createContext<IntlShape>(null as any);
const {Consumer: IntlConsumer, Provider: IntlProvider} = IntlContext;

export const Provider = IntlProvider;
export const Context = IntlContext;

export interface Opts<IntlPropName extends string = 'intl'> {
  intlPropName?: IntlPropName;
  forwardRef?: boolean;
  enforceContext?: boolean;
}

export type WrappedComponentProps<IntlPropName extends string = 'intl'> = {
  [k in IntlPropName]: IntlShape;
};

export type WithIntlProps<P> = Omit<P, keyof WrappedComponentProps> & {
  forwardedRef?: React.Ref<any>;
};

export default function injectIntl<
  IntlPropName extends string = 'intl',
  P extends WrappedComponentProps<IntlPropName> = WrappedComponentProps<any>
>(
  WrappedComponent: React.ComponentType<P>,
  options?: Opts<IntlPropName>
): React.ComponentType<WithIntlProps<P>> & {
  WrappedComponent: typeof WrappedComponent;
} {
  const {intlPropName = 'intl', forwardRef = false, enforceContext = true} =
    options || {};

  const WithIntl: React.FC<P & {forwardedRef?: React.Ref<any>}> & {
    WrappedComponent: typeof WrappedComponent;
  } = props => {
    return (
      <IntlConsumer>
        {intl => {
          if (enforceContext) {
            invariantIntlContext({intl});
          }

          return (
            <WrappedComponent
              {...props}
              {...{
                [intlPropName]: intl,
              }}
              ref={forwardRef ? props.forwardedRef : null}
            />
          );
        }}
      </IntlConsumer>
    );
  };

  WithIntl.displayName = `injectIntl(${getDisplayName(WrappedComponent)})`;
  WithIntl.WrappedComponent = WrappedComponent;

  if (forwardRef) {
    return hoistNonReactStatics(
      React.forwardRef((props: P, ref) => (
        <WithIntl {...props} forwardedRef={ref} />
      )),
      WrappedComponent
    ) as any;
  }

  return hoistNonReactStatics(WithIntl, WrappedComponent) as any;
}
