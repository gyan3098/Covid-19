// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#858796';

function number_format(number, decimals, dec_point, thousands_sep) {
  // *     example: number_format(1234.56, 2, ',', ' ');
  // *     return: '1 234,56'
  number = (number + '').replace(',', '').replace(' ', '');
  var n = !isFinite(+number) ? 0 : +number,
    prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
    sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
    dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
    s = '',
    toFixedFix = function(n, prec) {
      var k = Math.pow(10, prec);
      return '' + Math.round(n * k) / k;
    };
  // Fix for IE parseFloat(0.55).toFixed(0) = 0;
  s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
  if (s[0].length > 3) {
    s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
  }
  if ((s[1] || '').length < prec) {
    s[1] = s[1] || '';
    s[1] += new Array(prec - s[1].length + 1).join('0');
  }
  return s.join(dec);
}

// Bar Chart Example
var max =0;
var i = 0;
console.log(max)
var epicentre = ""
for(i=0;i<33;i++){
  if(data.data[i].confirmed > max){
    max = data.data[i].confirmed;
  }
}
console.log("max"+max)
// console.log(data.data[i].loc)
// console.log("epicentre " +epicentre)
var i = 0
var ctx = document.getElementById("myBarChart");
var myBarChart = new Chart(ctx, {
  type: 'bar',
  data: {

    labels: [data.data[0].loc, data.data[1].loc,data.data[2].loc,data.data[3].loc,data.data[4].loc,data.data[5].loc,data.data[6].loc,data.data[7].loc,
    data.data[8].loc,data.data[9].loc,data.data[10].loc,data.data[11].loc,data.data[12].loc,data.data[13].loc,data.data[14].loc,data.data[15].loc,
    data.data[16].loc,data.data[17].loc,data.data[18].loc,data.data[19].loc,data.data[20].loc,data.data[21].loc,data.data[22].loc,data.data[23].loc,
    data.data[24].loc,data.data[25].loc,data.data[26].loc,data.data[27].loc,data.data[28].loc,data.data[29].loc,data.data[30].loc,data.data[31].loc,
    data.data[32].loc],
    datasets: [{
      label: "Cases",
      backgroundColor: "#4e73df",
      hoverBackgroundColor: "#2e59d9",
      borderColor: "#4e73df",
      data: [data.data[0].confirmed, data.data[1].confirmed,data.data[2].confirmed,data.data[3].confirmed,data.data[4].confirmed,data.data[5].confirmed,data.data[6].confirmed,data.data[7].confirmed,
      data.data[8].confirmed,data.data[9].confirmed,data.data[10].confirmed,data.data[11].confirmed,data.data[12].confirmed,data.data[13].confirmed,data.data[14].confirmed,data.data[15].confirmed,
      data.data[16].confirmed,data.data[17].confirmed,data.data[18].confirmed,data.data[19].confirmed,data.data[20].confirmed,data.data[21].confirmed,data.data[22].confirmed,data.data[23].confirmed,
      data.data[24].confirmed,data.data[25].confirmed,data.data[26].confirmed,data.data[27].confirmed,data.data[28].confirmed,data.data[29].confirmed,data.data[30].confirmed,data.data[31].confirmed,
      data.data[32].confirmed],
    }],
  },
  options: {
    maintainAspectRatio: false,
    layout: {
      padding: {
        left: 10,
        right: 25,
        top: 25,
        bottom: 0
      }
    },
    scales: {
      xAxes: [{
        time: {
          unit: 'state'
        },
        gridLines: {
          display: false,
          drawBorder: false
        },
        ticks: {
          maxTicksLimit: 33
        },
        maxBarThickness: 25,
      }],
      yAxes: [{
        ticks: {
          min: 0,
          max: max,
          maxTicksLimit: 5,
          padding: 10,
          // Include a dollar sign in the ticks
          callback: function(value, index, values) {
            return number_format(value);
          }
        },
        gridLines: {
          color: "rgb(234, 236, 244)",
          zeroLineColor: "rgb(234, 236, 244)",
          drawBorder: false,
          borderDash: [2],
          zeroLineBorderDash: [2]
        }
      }],
    },
    legend: {
      display: false
    },
    tooltips: {
      titleMarginBottom: 10,
      titleFontColor: '#6e707e',
      titleFontSize: 14,
      backgroundColor: "rgb(255,255,255)",
      bodyFontColor: "#858796",
      borderColor: '#dddfeb',
      borderWidth: 1,
      xPadding: 15,
      yPadding: 15,
      displayColors: false,
      caretPadding: 10,
      callbacks: {
        label: function(tooltipItem, chart) {
          var datasetLabel = chart.datasets[tooltipItem.datasetIndex].label || '';
          return datasetLabel + ': ' + number_format(tooltipItem.yLabel);
        }
      }
    },
  }
});
