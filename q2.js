/*
* Demo: Mortality 2008/2013
*
*/
// Call run when the page finishes loading

window.addEventListener("load",run);
var GLOBAL={"data":"",
"causes":CAUSE,
"months":[1,2,3,4,5,6,7,8,9,10,11,12],
"years":[2003, 2008, 2013],
"selected_causes":[],
"totals":{"2003":[],"2008":[],"2013":[]},
"maxval":0,
"minval":100000000}; //currently totalval is used so that you can turn it into a percent. 


function run() {
	var svg = d3.selectAll("svg");
	svg.append("text")
	.attr("class","loading")
	.attr("x",+svg.attr("width")/2)
	.attr("y",+svg.attr("height")/2)
	.attr("dy","0.35em")
	.style("text-anchor","middle")
	.text("loading data...");
	getData(function(data) {
	GLOBAL.data = data["data"];
	GLOBAL.cause=CAUSE;
	GLOBAL.months = data["month"];
	GLOBAL.years = data["year"];
	updateCausesView();
	});
}

/*
* Summing up totals from the causes. Run the checkChanged before running sum_Total_Months.
*/

function sum_Total_Months() {
	GLOBAL.data.forEach(function(r) //for each row in the data
	{
	if (GLOBAL.selected_causes.length==0){ //take it as taking the totals of all causes
		if (r.month in GLOBAL.totals[r.year]){ //if it is, just update
			GLOBAL.totals[r.year][r["month"]]={"month":r["month"],"number":GLOBAL.totals[r.year][r["month"]]["number"]+r["number"]}
		} else { //if that month isn't in the total
			GLOBAL.totals[r.year][r["month"]]={"month":r["month"],"number":r["number"]}; // month: number
		}

	} else { 
		if (GLOBAL.selected_causes.indexOf(r.cause.toString())!=-1){
			if (r.month in GLOBAL.totals[r.year]){
				GLOBAL.totals[r.year][r["month"]]={"month":r["month"],"number":GLOBAL.totals[r.year][r["month"]]["number"]+r["number"]}
			} else { //if that month isn't in the total
				GLOBAL.totals[r.year][r["month"]]={"month":r["month"],"number":r["number"]}; // month: number
			}
		}
	}
	});
	return GLOBAL.totals
}

function updateCausesView() {
	createCausesView(sum_Total_Months());
}

/* 
* checks whenever a checkbox has been clicked
* and updates the viz accordingly to add or remove the cause from the totals
*/

function check_changed() {
    var svg = d3.select("#viz-age");
	svg.selectAll("*").remove(); //clears the viz
	GLOBAL.totals={"2003":[],"2008":[],"2013":[]}; //reset

	for (cause_index in GLOBAL.cause){
		var cause = GLOBAL.cause[cause_index]; //this gets the string version
		if (document.getElementById(cause_index).checked === true && GLOBAL.selected_causes.indexOf(cause_index)==-1){ //if checked and not in list
			GLOBAL.selected_causes.push(cause_index);
		} else { //if it has already been checked before
			var index = GLOBAL.selected_causes.indexOf(cause_index);
			if (index>-1){
				GLOBAL.selected_causes.splice(index,1);}
		}
	}
	// Update the visualization
	updateCausesView();
}

/*
* Create a simple visual representation
* of the data
*
*/
function createCausesView() {
	GLOBAL.maxval=0; //reset
GLOBAL.minval=100000000;

for (y in GLOBAL.years){ //for each year
for (val in GLOBAL.totals[GLOBAL.years[y]]){ //for each month in each year
	
	if (GLOBAL.maxval<GLOBAL.totals[GLOBAL.years[y]][val]["number"]){ //find the highest death value
		GLOBAL.maxval=GLOBAL.totals[GLOBAL.years[y]][val]["number"];
	}
	if (GLOBAL.minval>GLOBAL.totals[GLOBAL.years[y]][val]["number"]){ //find the lowest death value
		GLOBAL.minval=GLOBAL.totals[GLOBAL.years[y]][val]["number"];
	}
}
}
var svg = d3.select("#viz-age");

var vis = svg,
WIDTH = 1000,
HEIGHT = 500,
MARGINS = {
top: 20,
right: 20,
bottom: 20,
left: 100
},
xScale = d3.scale.linear().range([MARGINS.left, WIDTH - MARGINS.right]).domain([1, 24]),
yScale = d3.scale.linear().range([HEIGHT - MARGINS.top, MARGINS.bottom]).domain([GLOBAL.minval-100, GLOBAL.maxval+100]),
xAxis = d3.svg.axis()
.scale(xScale),
yAxis = d3.svg.axis()
.scale(yScale)
.orient("left");



var line = d3.svg.line()
.x(function(d) {
return xScale(d.month);
})
.y(function(d) {

return yScale(d.number);
});

var colors = ["blue","red","green","black","blue","gray"];
//for (total in GLOBAL.totals){console.log(GLOBAL.totals[total]);}
for (total in GLOBAL.totals){ //err we are going to try for looping through

var simpler=[]; //the other array of GLOBAL.total had the month in it for easier updating...

simpler.push(GLOBAL.totals[total]);
// GLOBAL.totals[total].forEach(function(r){
// simpler.push(r); //we'll just use this :')
// })


var tryagain=[];

for (each in simpler[0]){
	tryagain.push(simpler[0][each]);
}
//console.log("tryagain: "+tryagain);
//console.log(simpler[0]);
vis.append("svg:g")
.attr("class", "x axis")
.attr("transform", "translate(0," + (HEIGHT - MARGINS.bottom) + ")")
.call(xAxis);
vis.append("svg:g")
.attr("class", "y axis")
.attr("transform", "translate(" + (MARGINS.left) + ",0)")
.call(yAxis);
vis.append("svg:path")
	.attr("d", line(tryagain))
	   .attr("stroke-width", "2")
	   .attr("stroke","blue");

}

d3.selectAll(".axis").attr("stroke","black");
}


/*
* Convert a cause code to text
*
*/
function causeText (i) {
var index = CAUSE[i].indexOf("(");
if (index < 0) {
return CAUSE[i];
} else {
return CAUSE[i].slice(0,index-1);
}
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