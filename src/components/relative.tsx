/*
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

import * as React from 'react';
import withIntl from './injectIntl';
import {IntlShape, FormatRelativeTimeOptions} from '../types';
import {Unit} from '@formatjs/intl-relativetimeformat';
import * as invariant_ from 'invariant';
// Since rollup cannot deal with namespace being a function,
// this is to interop with TypeScript since `invariant`
// does not export a default
// https://github.com/rollup/rollup/issues/1267
const invariant = invariant_;

const MINUTE = 60;
const HOUR = 60 * 60;
const DAY = 60 * 60 * 24;

function selectUnit(seconds: number): Unit {
  const absValue = Math.abs(seconds);

  if (absValue < MINUTE) {
    return 'second';
  }

  if (absValue < HOUR) {
    return 'minute';
  }

  if (absValue < DAY) {
    return 'hour';
  }

  return 'day';
}

function getDurationInSeconds(unit?: Unit): number {
  switch (unit) {
    case 'second':
      return 1;
    case 'minute':
      return MINUTE;
    case 'hour':
      return HOUR;
    default:
      return DAY;
  }
}

function valueToSeconds(value?: number, unit?: Unit): number {
  if (!value) {
    return 0;
  }
  switch (unit) {
    case 'second':
      return value;
    case 'minute':
      return value * MINUTE;
    default:
      return value * HOUR;
  }
}

export interface Props extends FormatRelativeTimeOptions {
  intl: IntlShape;
  value?: number;
  unit?: Unit;
  updateIntervalInSeconds?: number;
  children?(value: string): React.ReactChild;
}

interface State {
  currentValueInSeconds: number;
}

const INCREMENTABLE_UNITS: Unit[] = ['second', 'minute', 'hour'];
function canIncrement(unit: Unit = 'second') {
  return INCREMENTABLE_UNITS.includes(unit);
}

function verifyProps(updateIntervalInSeconds?: number, unit?: Unit) {
  invariant(
    !updateIntervalInSeconds || (updateIntervalInSeconds && canIncrement(unit)),
    'Cannot schedule update with unit longer than hour'
  );
}

class FormattedRelativeTime extends React.PureComponent<Props, State> {
  // Public for testing
  _updateTimer: any = null;
  static defaultProps: Pick<Props, 'unit' | 'value'> = {
    value: 0,
    unit: 'second',
  };
  state: State = {
    currentValueInSeconds: canIncrement(this.props.unit)
      ? valueToSeconds(this.props.value, this.props.unit)
      : 0,
  };

  constructor(props: Props) {
    super(props);
    verifyProps(props.updateIntervalInSeconds, props.unit);
  }

  scheduleNextUpdate(
    {updateIntervalInSeconds, unit}: Props,
    {currentValueInSeconds}: State
  ) {
    clearTimeout(this._updateTimer);
    this._updateTimer = null;
    // If there's no interval and we cannot increment this unit, do nothing
    if (!updateIntervalInSeconds || !canIncrement(unit)) {
      return;
    }
    // Figure out the next interesting time
    const nextValueInSeconds = currentValueInSeconds - updateIntervalInSeconds;
    const nextUnit = selectUnit(nextValueInSeconds);
    // We've reached the max auto incrementable unit, don't schedule another update
    if (nextUnit === 'day') {
      return this.setState({
        currentValueInSeconds: nextValueInSeconds < 0 ? -DAY : DAY,
      });
    }

    const unitDuration = getDurationInSeconds(nextUnit);
    const remainder = nextValueInSeconds % unitDuration;
    const prevInterestingValueInSeconds = nextValueInSeconds - remainder;
    const nextInterestingValueInSeconds =
      prevInterestingValueInSeconds >= currentValueInSeconds
        ? prevInterestingValueInSeconds - unitDuration
        : prevInterestingValueInSeconds;
    const delayInSeconds = Math.abs(
      nextInterestingValueInSeconds - currentValueInSeconds
    );

    this._updateTimer = setTimeout(
      () =>
        this.setState({
          currentValueInSeconds: nextInterestingValueInSeconds,
        }),
      delayInSeconds * 1e3
    );
  }

  componentDidMount() {
    this.scheduleNextUpdate(this.props, this.state);
  }

  componentDidUpdate() {
    this.scheduleNextUpdate(this.props, this.state);
  }

  componentWillUnmount() {
    clearTimeout(this._updateTimer);
    this._updateTimer = null;
  }

  componentWillReceiveProps(nextProps: Props) {
    if (
      this.props.value !== nextProps.value ||
      this.props.unit !== nextProps.unit
    ) {
      this.setState({
        currentValueInSeconds: canIncrement(nextProps.unit)
          ? valueToSeconds(nextProps.value, nextProps.unit)
          : 0,
      });
    }
  }

  render() {
    const {formatRelativeTime, textComponent: Text} = this.props.intl;
    const {children, value, unit, updateIntervalInSeconds} = this.props;
    const {currentValueInSeconds} = this.state;
    let currentValue = value || 0;
    let currentUnit = unit;

    if (
      canIncrement(unit) &&
      currentValueInSeconds &&
      updateIntervalInSeconds
    ) {
      currentUnit = selectUnit(currentValueInSeconds);
      const unitDuration = getDurationInSeconds(currentUnit);
      currentValue = Math.round(currentValueInSeconds / unitDuration);
    }

    const formattedRelativeTime = formatRelativeTime(
      currentValue,
      currentUnit,
      {
        ...this.props,
      }
    );

    if (typeof children === 'function') {
      return children(formattedRelativeTime);
    }
    return <Text>{formattedRelativeTime}</Text>;
  }
}

export const BaseFormattedRelativeTime = FormattedRelativeTime;

export default withIntl(FormattedRelativeTime);
