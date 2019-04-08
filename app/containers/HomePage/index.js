/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 *
 * NOTE: while this component should technically be a stateless functional
 * component (SFC), hot reloading does not currently support SFCs. If hot
 * reloading is not a necessity for you then you can refactor it and remove
 * the linting exception.
 */

import React from 'react';
import { VictoryChart, VictoryLine } from 'victory';

const monthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sept',
  'Oct',
  'Nov',
  'Dec',
];

/* eslint-disable react/prefer-stateless-function */
export default class HomePage extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
    };

    this.watchDog = null;
    this.fillGraphData = this.fillGraphData.bind(this);
  }

  fillGraphData() {
    fetch(
      'https://ynb3w6woc8.execute-api.us-east-2.amazonaws.com/dev/revenueForecastMonthlyAggs',
    )
      .then(resp => resp.json())
      .then(resp => {
        const dataArr = resp.map(item => {
          const monthName = monthNames[new Date(item.revenue_month).getMonth()];
          const yearName = new Date(item.revenue_month).getFullYear();
          return {
            x: `${monthName}/${yearName}`,
            y: item.usage,
          };
        });
        this.setState({ data: dataArr });
      });
  }

  componentDidMount() {
    this.fillGraphData();
    // this.watchDog = setInterval(() => {
    //   console.log('Watch dog started ....');
    //   this.fillGraphData();
    //   console.log('Watch dog finished ....');
    // }, 30000);
  }

  componentWillMount() {
    clearInterval(this.watchDog);
  }

  render() {
    return (
      <div>
        <VictoryChart>
          <VictoryLine
            style={{
              data: { stroke: '#c43a31' },
              parent: { border: '1px solid #ccc' },
            }}
            data={this.state.data}
          />
        </VictoryChart>
      </div>
    );
  }
}
