// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#858796';

// Pie Chart Example
console.log(data.total)
var tot = data.total[0].totalConfirmed +  data.total[0].totalDeaths + data.total[0].totalRecovered;
console.log(tot)
var ctx = document.getElementById("myPieChart");
var myPieChart = new Chart(ctx, {
  type: 'doughnut',
  data: {
    labels: ["%Deaths", "%Recovered", "%Cases"],
    datasets: [{
      data: [data.total[0].totalDeaths*100/tot, data.total[0].totalRecovered*100/tot, data.total[0].totalConfirmed*100/tot],
      backgroundColor: ['#e74a3b', '#1cc88a', '#f6c23e'],
      hoverBackgroundColor: ['#e74a3b', '#1cc88a', '#f6c23e'],
      hoverBorderColor: "rgba(234, 236, 244, 1)",
    }],
  },
  options: {
    maintainAspectRatio: false,
    tooltips: {
      backgroundColor: "rgb(255,255,255)",
      bodyFontColor: "#858796",
      borderColor: '#dddfeb',
      borderWidth: 1,
      xPadding: 15,
      yPadding: 15,
      displayColors: false,
      caretPadding: 10,
    },
    legend: {
      display: false
    },
    cutoutPercentage: 80,
  },
});
