document.getElementById("cases").innerHTML = data.total[0].totalConfirmed;
document.getElementById("died").innerHTML = data.total[0].totalDeaths;
document.getElementById("recovered").innerHTML = data.total[0].totalRecovered;
document.getElementById("new").innerHTML = data.total[0].totalNewCases;