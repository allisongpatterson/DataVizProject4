

/*
 * Demo: Mortality 2008/2013
 * 
 */






// Call run when the page finishes loading
      
window.addEventListener("load",run);


var GLOBAL = {};

function run () {
    var svg = d3.selectAll("svg");
    svg.append("text")
	.attr("class","loading")
	.attr("x",+svg.attr("width")/2)
	.attr("y",+svg.attr("height")/2)
	.attr("dy","0.35em")
	.style("text-anchor","middle")
	.text("loading data...");

    getData(function(data) {
	GLOBAL.data = data;
	createAgesView(data);
    });
}


/*
 * Functions for summing up totals from the
 * data
 * 
 */

function createAgesView(data){
var margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50
},
width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;



//get the max y of the domain, so that itll never go beyond screen
var sum = new Array(data.length); //placeholder array
for(var x=0; x<data.length; x++) {
    sum[x] = 0;
    for(var y=0; y<data.length; y++) {
        sum[x] += data[y][x];   //sum up values vertically
    }
}

// permute the data 

data = data["data"].forEach(function (d) {
	console.log(d);
    return d['test']=(function (p, i) {
        return {
            x: i,
            y: p,
            y0: 0
        };
    });
});

var color = d3.scale.linear()
    .range(["#0A3430", "#1E5846", "#3E7E56", "#6BA55F", "#A4CA64", "#E8ED69"]);

var x = d3.scale.linear()
    .range([0, width])
    .domain([0, 130]); //the ages?

var y = d3.scale.linear()
    .range([height, 0])
    .domain([0, d3.max(sum)]); //max y is the sum we calculated earlier

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var stack = d3.layout.stack()
    .offset("wiggle") //<-- creates a streamgraph

var layers = stack(data);

//vis type
var area = d3.svg.area()
    .interpolate('cardinal')
    .x(function (d, i) {
    return x(i);
})
    .y0(function (d) {
    return y(d.y0);
})
    .y1(function (d) {
    return y(d.y0 + d.y);
});

svg.selectAll(".layer")
    .data(layers)
    .enter().append("path")
    .attr("class", "layer")
    .attr("d", function (d) {
    return area(d);
})
    .style("fill", function (d, i) {
    return color(i);
});

}



var CAUSE = {
    "1":"Tuberculosis (A16-A19)",
    "2":"Syphilis (A50-A53)",
    "3":"Human immunodeficiency virus (HIV) disease (B20-B24)",
    "4":"Malignant neoplasms (C00-C97)",
    "5":"Malignant neoplasm of stomach (C16)",
    "6":"Malignant neoplasms of colon, rectum and anus (C18-C21)",
    "7":"Malignant neoplasm of pancreas (C25)",
    "8":"Malignant neoplasms of trachea, bronchus and lung (C33-C34)",
    "9":"Malignant neoplasm of breast (C50)",
    "10":"Malignant neoplasms of cervix uteri, corpus uteri and ovary (C53-C56)",
    "11":"Malignant neoplasm of prostate (C61)",
    "12":"Malignant neoplasms of urinary tract (C64-C68)",
    "13":"Non-Hodgkin's lymphoma (C82-C85)",
    "14":"Leukemia (C91-C95)",
    "15":"Other malignant neoplasms (C00-C15,C17,C22-C24,C26-C32,C37-C49,C51-C52, C57-C60,C62-C63,C69-C81,C88,C90,C96-C97)",
    "16":"Diabetes mellitus (E10-E14)",
    "17":"Alzheimer's disease (G30)",
    "18":"Major cardiovascular diseases (I00-I78)",
    "19":"Diseases of heart (I00-I09,I11,I13,I20-I51)",
    "20":"Hypertensive heart disease with or without renal disease (I11,I13)",
    "21":"Ischemic heart diseases (I20-I25)",
    "22":"Other diseases of heart (I00-I09,I26-I51)",
    "23":"Essential (primary) hypertension and hypertensive renal disease (I10,I12,I15)",
    "24":"Cerebrovascular diseases (I60-I69)",
    "25":"Atherosclerosis (I70)",
    "26":"Other diseases of circulatory system (I71-I78)",
    "27":"Influenza and pneumonia (J09-J18)",
    "28":"Chronic lower respiratory diseases (J40-J47)",
    "29":"Peptic ulcer (K25-K28)",
    "30":"Chronic liver disease and cirrhosis (K70,K73-K74)",
    "31":"Nephritis, nephrotic syndrome, and nephrosis (N00-N07,N17-N19,N25-N27)",
    "32":"Pregnancy, childbirth and the puerperium (O00-O99)",
    "33":"Certain conditions originating in the perinatal period (P00-P96)",
    "34":"Congenital malformations, deformations and chromosomal abnormalities (Q00-Q99)",
    "35":"Sudden infant death syndrome (R95)",
    "36":"Symptoms, signs and abnormal clinical and laboratory findings, not  elsewhere classified (excluding Sudden infant death syndrome) (R00-R94,R96-R99)",
    "37":"All other diseases (Residual) (A00-A09,A20-A49,A54-B19,B25-B99,D00-E07, E15-G25,G31-H93,I80-J06,J20-J39,J60-K22,K29-K66,K71-K72, K75-M99,N10-N15,N20-N23,N28-N98,U04)",
    "38":"Motor vehicle accidents (V02-V04,V09.0,V12-V14,V19.0-V19.2,V19.4-V19.6, V20-V79,V80.3-V80.5,V81.0-V81.1,V82.0-V82.1,V83-V86,V87.0-V87.8, V88.0-V88.8,V89.0,V89.2)",
    "39":"All other and unspecified accidents and adverse effects (V01,V05-V06,V09.1,V09.3-V09.9,V10-V11,V15-V18,V19.3,V19.8-V19.9, V80.0-V80.2,V80.6-V80.9,V81.2-V81.9,V82.2-V82.9,V87.9,V88.9,V89.1, V89.3,V89.9,V90-X59,Y40-Y86,Y88)",
    "40":"Intentional self-harm (suicide) (*U03,X60-X84,Y87.0)",
    "41":"Assault (homicide) (*U01-*U02,X85-Y09,Y87.1)",
    "42":"All other external causes (Y10-Y36,Y87.2,Y89)"
}
    

/*
 * Pulls the data
 * 
 */

function getData (f) {

    d3.json("data",function(error,data) {
		 if (error) {
		     d3.selectAll(".loading").remove();
		     console.log(error);
		 } else {
		     d3.selectAll(".loading").remove();
		  
		     console.log(" data =", data);
		     f(data);
		 }
	     });
}
      