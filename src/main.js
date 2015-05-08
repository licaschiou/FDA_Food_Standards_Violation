var rawData;
var cleanData = [];
var width = 960;
var height = 1200;
var padding = {
	left : 100,
	top : 60,
	right : 0,
	bottom : 400
};
var gridSize = 20;
var textSize = 12;
var tipPadding = 10;

var xScale = d3.scale.ordinal();
var yScale = d3.scale.ordinal();
var colorScale = d3.scale.threshold()
					.range(["#fff", "#feebe2", "#fcc5c0", "#fa9fb5", "#f768a1", "#c51b8a"]);

var svg = d3.select(".main")
			.append("svg")
			.attr("width", width + padding.left + padding.right)
			.attr("height", height + padding.top + padding.bottom);

var xAxis = d3.svg.axis()
				.scale(xScale)
				.orient("bottom");
var yAxis= d3.svg.axis()
				.scale(yScale)
				.orient("left");

var dataframe;
var table1;

var xVar = "原因";
var yVar = "產地";

var cells;

d3.json('data/52_3.json', function(error, json){
	rawData = json;

	//collapse redundant object
	for(var i = 0, n = rawData.length; i < n; i++){
		var cleanItem = {};
		for(var j = 0, m = rawData[i].length; j < m; j++){
			var keyName = Object.keys(rawData[i][j])[0];
			cleanItem[keyName] = rawData[i][j][keyName];
		}
		cleanData.push(cleanItem);				
	}

	dataframe = asDataframe(cleanData);

	table1 = twoWayTable(cleanData, xVar, yVar);

	xScale.domain(levels(dataframe[xVar]))
			.rangeRoundBands([padding.left, width]);
	yScale.domain(levels(dataframe[yVar]))
			.rangeRoundBands([padding.top, height]);

	colorScale.domain([1, 2, 3, 10, 50, d3.max(table1, function(d){
			return d.count;
		})
	]);

	cells = svg.selectAll("g")
				.data(table1)
				.enter()
				.append("g");

	cells.append("rect")
		.attr("x", function(d){return xScale(d[xVar]);})
		.attr("y", function(d){return yScale(d[yVar]);})
		.attr("fill", function(d){					
			return colorScale(d.count);
		})
		.attr("width", xScale.rangeBand() - 1)
		.attr("height", yScale.rangeBand() - 1)
		.on("mouseenter", function(d){		
			if(d.count > 0){
				appendTip(d);
			}
		})
		.on("mouseleave", function(d){
			if(d.count > 0){
				svg.selectAll(".tip")
					.remove();
			}
		});		


	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis);

	svg.append("g")
		.attr("class", "y axis")
		.attr("transform", "translate(" + padding.left + ", 0)")
		.call(yAxis);

	svg.select(".x.axis")
		.selectAll("text")		
		.attr("text-anchor", "start")
		.attr("y", function(){
			var textHeight = this.getBBox().height;
			return textHeight*0.5 - 20;
		});

	svg.select(".y.axis")
		.selectAll("text")
		.attr("text-anchor", "end");	

});


var appendTip = function(d){
	var text1 = xVar + " : " + d[xVar];
	var text2 = yVar + " : " + d[yVar];
	var text3 = "件數 : " + d.count;
	var tipWidth = textSize * d3.max([text1.length, text2.length, text3.length]);
	var tip = svg.append("g")
				.attr("class", "tip");
	tip.append("rect")
		.attr("pointer-events", "none")
		.attr("x", function(){
			tipWidth;
			return xScale(d[xVar]) - tipWidth*0.5;
		})
		.attr("y", function(){
			return yScale(d[yVar]) - 60;
		})
		.attr("width", tipWidth + 20)
		.attr("height", 64)
		.attr("stroke", "#eeeeee")
		.attr("stroke-width", 2)
		.attr("stroke-linecap", "square")					
		.attr("fill", "black");	

	tip.append("text")
		.text(text1)
		.attr("pointer-events", "none")
		.attr("font-size", textSize + "px")
		.attr("x", function(){
			return xScale(d[xVar]) - tipWidth*0.5 + tipPadding;
		})
		.attr("y", function(){
			return yScale(d[yVar]) - 38;
		});	
	tip.append("text")
		.text(text2)
		.attr("pointer-events", "none")
		.attr("font-size", textSize + "px")
		.attr("x", function(){
			return xScale(d[xVar]) - tipWidth*0.5 + tipPadding;;
		})
		.attr("y", function(){
			return yScale(d[yVar]) - 24;
		});	
	tip.append("text")
		.text(text3)
		.attr("pointer-events", "none")
		.attr("font-size", textSize + "px")
		.attr("x", function(){
			return xScale(d[xVar]) - tipWidth*0.5 + tipPadding;;
		})
		.attr("y", function(){
			return yScale(d[yVar]) - 10;
		});	
};
