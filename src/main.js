var rawData;
var cleanData = [];
var width = 960;
var height = 1200;
var padding = {
	left : 120,
	top : 50,
	right : 0,
	bottom : 400
};
var gridSize = 20;
var textSize = 12;
var tipPadding = 12;

var xScale = d3.scale.ordinal();
var yScale = d3.scale.ordinal();
var originScale = d3.scale.linear()
							.range([0, width - padding.left]);
var reasonScale = d3.scale.linear()
							.range([0, height - padding.bottom]);
var colorScale = d3.scale.threshold()
					.range(["#ffffff", "#ffffb2", "#fed976", "#fd8d3c", "#f03b20", "#bd0026"]);

var svg = d3.select("#chartOriginReason")
			.attr("width", width + padding.left + padding.right)
			.attr("height", height + padding.top + padding.bottom);

var xAxis = d3.svg.axis()
				.scale(xScale)
				.orient("bottom");
var yAxis= d3.svg.axis()
				.scale(yScale)
				.orient("left");

var xVar = "原因";
var yVar = "產地";

var dataframe;
var tableOrigin;
var chartOrigin;
var tableReason;
var chartReason;
var tableOriginReason;
var chartOriginReason;


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


	xScale.domain(levels(dataframe[xVar]))
			.rangeRoundBands([padding.left, width]);
	yScale.domain(levels(dataframe[yVar]))
			.rangeRoundBands([padding.top, height]);			

	var countOrigin = table(dataframe[yVar]);	
	tableOrigin = objectToArray(countOrigin);
	var countReason = table(dataframe[xVar]);	
	tableReason = objectToArray(countReason);

	//create origin ~ reason chart
	tableOriginReason = twoWayTable(cleanData, xVar, yVar);
	colorScale.domain([1, 2, 3, 10, 50, d3.max(tableOriginReason, function(d){
			return d.count + 1;
		})
	]);

	chartOriginReason = svg.selectAll("g")
							.data(tableOriginReason)
							.enter()
							.append("g");

	chartOriginReason.append("rect")
		.attr("x", function(d){return xScale(d[xVar]);})
		.attr("y", function(d){return yScale(d[yVar]);})
		.attr("fill", function(d){					
			return colorScale(d.count);
		})
		.attr("width", xScale.rangeBand() - 1)
		.attr("height", yScale.rangeBand() - 1)
		.on("mouseenter", function(d){		
			if(d.count > 0){
				appendCellTip(d);
			}
		})
		.on("mouseleave", function(d){
			if(d.count > 0){
				svg.selectAll(".tip")
					.remove();
			}
		});

	//append axis
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
		.data(tableReason)
		.attr("text-anchor", "start")
		.attr("y", function(){
			var textHeight = this.getBBox().height;
			if(this.textContent.indexOf('(') >= 0 || this.textContent.indexOf(')') >= 0)
			{
			  	return textHeight*0.5 - 20 + 4;
			}else{
				return textHeight*0.5 - 20;
			}			
		})
		.on("mouseenter", function(d){		
			appendXAxisTip(d);
		})
		.on("mouseleave", function(d){
			svg.selectAll(".tip")
					.remove();
		});

	svg.select(".y.axis")
		.selectAll("text")
		.data(tableOrigin)
		.attr("text-anchor", "end")
		.on("mouseenter", function(d){		
			appendYAxisTip(d);
		})
		.on("mouseleave", function(d){
			svg.selectAll(".tip")
					.remove();
		});

});



var appendXAxisTip = function(d){
	var text1 = d.category;
	var text2 =  "總件數 : " + d.count;
	var tipWidth = textSize * text1.length;
	var tip = svg.append("g")
				.attr("class", "tip");
	var rectHeight = 48;
			
	tip.append("path")
		.attr("pointer-events", "none")
		.attr("d", function(){
			return "M" + (xScale(d.category) - tipWidth*0.5) + " " + (height - 64)
				+ "L" + (xScale(d.category) - tipWidth*0.5 + tipWidth + tipPadding*2) + " " + (height - 64)
				+ "L" + (xScale(d.category) - tipWidth*0.5 + tipWidth + tipPadding*2) + " " + (height - 64 + rectHeight)
				+ "L" + (xScale(d.category) - tipWidth*0.5 + tipWidth + tipPadding*2) + " " + (height - 64 + rectHeight)
				+ "L" + (xScale(d.category) + xScale.rangeBand()*0.5 + 4) + " " + (height - 64 + rectHeight)
				+ "L" + (xScale(d.category) + xScale.rangeBand()*0.5 ) + " " + (height - 64 + 56)
				+ "L" + (xScale(d.category) + xScale.rangeBand()*0.5 - 4) + " " + (height - 64 + rectHeight)
				+ "L" + (xScale(d.category) - tipWidth*0.5) + " " + (height - 64 + rectHeight)
				+ "L" + (xScale(d.category) - tipWidth*0.5) + " " + (height - 64)
				+ "Z";
		})				
		.attr("fill", "black");	


	tip.append("text")
		.text(text1)
		.attr("pointer-events", "none")
		.attr("font-size", textSize + "px")
		.attr("x", function(){
			return xScale(d.category) - tipWidth*0.5 + tipPadding;;
		})
		.attr("y", function(){
			return height - 44;
		});	
	tip.append("text")
		.text(text2)
		.attr("pointer-events", "none")
		.attr("font-size", textSize + "px")
		.attr("x", function(){
			return xScale(d.category) - tipWidth*0.5 + tipPadding;;
		})
		.attr("y", function(){
			return height - 30;
		});	
}

var appendYAxisTip = function(d){
	var text1 = d.category;
	var text2 =  "總件數 : " + d.count;
	var tipWidth = textSize * d3.max([text1.length, text2.length]);
	var tip = svg.append("g")
				.attr("class", "tip");
	var rectHeight = 48;

	tip.append("path")
		.attr("pointer-events", "none")
		.attr("d", function(){
			return "M" + padding.left + " " + (yScale(d.category) - 14)
				+ "L" + (padding.left + tipWidth + tipPadding*2) + " " + (yScale(d.category) - 14)
				+ "L" + (padding.left + tipWidth + tipPadding*2) + " " + (yScale(d.category) - 14 + rectHeight)
				+ "L" + padding.left + " " + (yScale(d.category) - 14 + rectHeight)
				+ "L" + padding.left + " " + (yScale(d.category) - 14 + 28)
				+ "L" + (padding.left - 8) + " " + (yScale(d.category) - 14 + 24)
				+ "L" + padding.left + " " + (yScale(d.category) - 14 + 20)
				+ "L" + padding.left + " " + (yScale(d.category) - 14)
				+ "Z";
		})
		.attr("fill", "black");	

	tip.append("text")
		.text(text1)
		.attr("pointer-events", "none")
		.attr("font-size", textSize + "px")
		.attr("x", padding.left + tipPadding)
		.attr("y", function(){
			return yScale(d.category) + 6;
		});	
	tip.append("text")
		.text(text2)
		.attr("pointer-events", "none")
		.attr("font-size", textSize + "px")
		.attr("x", padding.left + tipPadding)
		.attr("y", function(){
			return yScale(d.category) + 20;
		});	
}


var appendCellTip = function(d){
	var text1 = xVar + " : " + d[xVar];
	var text2 = yVar + " : " + d[yVar];
	var text3 = "件數 : " + d.count;
	var tipWidth = textSize * d3.max([text1.length, text2.length, text3.length]);
	var tip = svg.append("g")
				.attr("class", "tip");
	var rectHeight = 64;
	var yOffset = 64;
	var textOffset = 14;
	var lineHeight = textSize + 2;
	tip.append("path")
		.attr("pointer-events", "none")
		.attr("d", function(){
			return "M" + (xScale(d[xVar]) - tipWidth*0.5) + " " + (yScale(d[yVar]) - yOffset)
				+ "L" + (xScale(d[xVar]) - tipWidth*0.5 + tipWidth + tipPadding*2) + " " + (yScale(d[yVar]) - yOffset)
				+ "L" + (xScale(d[xVar]) - tipWidth*0.5 + tipWidth + tipPadding*2) + " " + (yScale(d[yVar]) - yOffset + rectHeight)
				+ "L" + (xScale(d[xVar]) + xScale.rangeBand()*0.5 + 4) + " " + (yScale(d[yVar]) - yOffset + rectHeight)
				+ "L" + (xScale(d[xVar]) + xScale.rangeBand()*0.5) + " " + (yScale(d[yVar]) - yOffset + rectHeight + 8)
				+ "L" + (xScale(d[xVar]) + xScale.rangeBand()*0.5 - 4) + " " + (yScale(d[yVar]) - yOffset + rectHeight)
				+ "L" + (xScale(d[xVar]) - tipWidth*0.5) + " " + (yScale(d[yVar]) - yOffset + rectHeight)
				+ "L" + (xScale(d[xVar]) - tipWidth*0.5) + " " + (yScale(d[yVar]) - yOffset)
				+ "Z";
		})				
		.attr("fill", "black");	

	tip.append("text")
		.text(text1)
		.attr("pointer-events", "none")
		.attr("font-size", textSize + "px")
		.attr("x", function(){
			return xScale(d[xVar]) - tipWidth*0.5 + tipPadding;
		})
		.attr("y", function(){
			return yScale(d[yVar]) - (textOffset + 2*lineHeight);
		});	
	tip.append("text")
		.text(text2)
		.attr("pointer-events", "none")
		.attr("font-size", textSize + "px")
		.attr("x", function(){
			return xScale(d[xVar]) - tipWidth*0.5 + tipPadding;;
		})
		.attr("y", function(){
			return yScale(d[yVar]) - (textOffset + lineHeight);
		});	
	tip.append("text")
		.text(text3)
		.attr("pointer-events", "none")
		.attr("font-size", textSize + "px")
		.attr("x", function(){
			return xScale(d[xVar]) - tipWidth*0.5 + tipPadding;;
		})
		.attr("y", function(){
			return yScale(d[yVar]) - textOffset;
		});	
};
