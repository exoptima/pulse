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
import { VictoryChart, VictoryLine, VictoryZoomContainer, VictoryBrushContainer, VictoryVoronoiContainer } from 'victory';

const colors = ['red', 'green', 'blue', 'orange', 'yellow'];
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

Array.prototype.unique = function () {
  var arr = [];
  for (var i = 0; i < this.length; i++) {
    if (!arr.includes(this[i])) {
      arr.push(this[i]);
    }
  }
  return arr;
}

/* eslint-disable react/prefer-stateless-function */
export default class HomePage extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      selectedDomain: null
    };

    this.watchDog = null;
    this.fillGraphData = this.fillGraphData.bind(this);
    this.handleZoom = this.handleZoom.bind(this);
  }

  fillGraphData() {
    fetch(
      'https://ynb3w6woc8.execute-api.us-east-2.amazonaws.com/dev/revenueForecastMonthlyAggs',
    )
      .then(resp => resp.json())
      .then(resp => {
        var subCats3 = resp.map(item => item.sub_category_3).unique();
        var dataWithCats = [];

        subCats3.forEach((subCat, index) => {
          var filterdResp = resp.filter(item => item.sub_category_3 === subCat);

          var dataArr = [];
          filterdResp.forEach(item => {
            const monthName = monthNames[new Date(item.revenue_month).getMonth()];
            const yearName = new Date(item.revenue_month).getFullYear();
            var revenueDate = `${monthName}/${yearName}`;

            var dataIndex = dataArr.findIndex(data => data.x === revenueDate);
            if (dataIndex > -1) {
              dataArr[dataIndex].y += item.usage;
            } else {
              dataArr.push({
                x: revenueDate,
                y: item.usage,
              });
            }
          });

          dataWithCats.push({
            color: colors[index],
            cat: subCat,
            dataList: dataArr
          });
        });



        this.setState({ data: dataWithCats });
      });
  }

  componentDidMount() {
    this.fillGraphData();
    this.watchDog = setInterval(() => {
      console.log('Watch dog started ....');
      this.fillGraphData();
      console.log('Watch dog finished ....');
    }, 18000000);
  }

  componentWillMount() {
    clearInterval(this.watchDog);
  }

  handleZoom(domain) {
    this.setState({ selectedDomain: domain });
  }

  render() {
    let { data, selectedDomain } = this.state;

    let uniqueCatsColor = data.map(dt => {
      return {
        color: dt.color,
        cat: dt.cat
      }
    });

    return (
      <div>
        <div className="chart-container">
          <VictoryChart
            containerComponent={
              <VictoryZoomContainer allowPan={false} allowZoom={false} zoomDomain={selectedDomain} />
            }
          >
            {data.map((dt) => {
              return <VictoryLine
                style={{
                  data: { stroke: dt.color }
                }}
                data={dt.dataList}
                label={dt.cat}
                name={dt.cat}
                labels={(datum) => datum.y}
              />
            })}
          </VictoryChart>
        </div>
        <div className="brush-control-container">
          <VictoryChart
            width={700}
            containerComponent={
              <VictoryBrushContainer
                brushDimension="x"
                brushDomain={selectedDomain}
                onBrushDomainChange={this.handleZoom}
              />
            }
          >
            {data.map((dt) => {
              return <VictoryLine
                style={{
                  data: { stroke: dt.color }
                }}
                data={dt.dataList}
                name={dt.cat}
              />
            })}
          </VictoryChart>
        </div>
        <div style={{ display: 'inline-block', position: 'relative', left: '50%', transform: 'translateX(-50%)' }}>
          {uniqueCatsColor.map(ucc => {
            return <div style={{ display: 'inline-block', margin: '0 20px' }}>{ucc.cat || 'null'} <div style={{
              backgroundColor: ucc.color,
              width: '14px',
              height: '6px',
              display: 'inline-block'
            }}></div></div>
          })}
        </div>
        <div className="voronoi-container">
          <VictoryChart
            containerComponent={
              <VictoryVoronoiContainer
                labels={(d) => `${d.y}, ${d.x}`}
              />
            }
          >
            {data.map((dt) => {
              return <VictoryLine
                style={{
                  data: { stroke: dt.color }
                }}
                data={dt.dataList}
                name={dt.cat}
              />
            })}
          </VictoryChart>
          <div style={{ display: 'inline-block', position: 'relative', left: '50%', transform: 'translateX(-50%)' }}>
            {uniqueCatsColor.map(ucc => {
              return <div style={{ display: 'inline-block', margin: '0 20px' }}>{ucc.cat || 'null'} <div style={{
                backgroundColor: ucc.color,
                width: '14px',
                height: '6px',
                display: 'inline-block'
              }}></div></div>
            })}
          </div>
        </div>
      </div>
    );
  }
}
