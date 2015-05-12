var rawData;
var cleanData = [];
var widthSvg1 = 960;
var heightSvg1 = 1200;
var padding1 = {
	left : 120,
	top : 50,
	right : 80,
	bottom : 400
};
var textSize = 12;
var tipPadding = 12;

//chart1
var xScale1 = d3.scale.ordinal();
var yScale1 = d3.scale.ordinal();

var colorScale = d3.scale.threshold()
					.range(["#ffffff", "#fff7ec", "#fee8c8", "#fdd49e", "#fc8d59", "#fc8d59", "#e31a1c", "#bd0026"]);
var svg1 = d3.select("#chartOriginReason")
			.attr("width", widthSvg1 + padding1.left + padding1.right)
			.attr("height", heightSvg1 + padding1.top + padding1.bottom);

var xAxis1 = d3.svg.axis()
				.scale(xScale1)
				.orient("bottom");
var yAxis1= d3.svg.axis()
				.scale(yScale1)
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


	xScale1.domain(levels(dataframe[xVar]))
			.rangeRoundBands([padding1.left, widthSvg1]);
	yScale1.domain(levels(dataframe[yVar]))
			.rangeRoundBands([padding1.top, heightSvg1]);			

	var countOrigin = table(dataframe[yVar]);	
	tableOrigin = objectToArray(countOrigin);
	var countReason = table(dataframe[xVar]);	
	tableReason = objectToArray(countReason);

	//create origin ~ reason chart
	tableOriginReason = twoWayTable(cleanData, xVar, yVar);
	colorScale.domain([1, 2, 3, 10, 50, 100, 200, d3.max(tableOriginReason, function(d){
			return d.count + 1;
		})
	]);

	chartOriginReason = svg1.selectAll("g")
							.data(tableOriginReason)
							.enter()
							.append("g");

	chartOriginReason.append("rect")
		.attr("x", function(d){return xScale1(d[xVar]);})
		.attr("y", function(d){return yScale1(d[yVar]);})
		.attr("fill", function(d){					
			return colorScale(d.count);
		})
		.attr("width", xScale1.rangeBand() - 1)
		.attr("height", yScale1.rangeBand() - 1)
		.on("mouseenter", function(d){		
			if(d.count > 0){
				appendCellTip(d);
			}
		})
		.on("mouseleave", function(d){
			if(d.count > 0){
				svg1.selectAll(".tip")
					.remove();
			}
		});

	//append axis
	svg1.append("g")
		.attr("class", "category x axis")
		.attr("transform", "translate(0," + heightSvg1 + ")")
		.call(xAxis1);

	svg1.append("g")
		.attr("class", "category y axis")
		.attr("transform", "translate(" + padding1.left + ", 0)")
		.call(yAxis1);

	svg1.select(".category.x.axis")
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
			svg1.selectAll(".tip")
					.remove();
		});

	svg1.select(".y.axis")
		.selectAll("text")
		.data(tableOrigin)
		.attr("text-anchor", "end")
		.on("mouseenter", function(d){		
			appendYAxisTip(d);
		})
		.on("mouseleave", function(d){
			svg1.selectAll(".tip")
					.remove();
		});

	renderSvg2();
});

//chart2
var widthSvg2 = 960;
var heightSvg2 = 600;
var padding2 = {
	left : 60,
	top : 20,
	right : 80,
	bottom : 40
};
var svg2 = d3.select("#reportedTime")
			.attr("width", widthSvg2 + padding2.left + padding2.right)
			.attr("height", heightSvg2 + padding2.top + padding2.bottom);

var xScale2 = d3.time.scale()
					.range([padding2.left, widthSvg2 - padding2.left - padding2.right]);
var yScale2 = d3.scale.linear()
					.range([heightSvg2 - padding2.top, padding2.bottom]);

var xAxis2 = d3.svg.axis()
					.scale(xScale2)
					.orient("bottom")
					.ticks(8);

var yAxis2 = d3.svg.axis()
					.scale(yScale2)
					.orient("left")
					.ticks(10);

var line = d3.svg.line();					

var parseTimeEn = d3.time.format("%Y").parse;
var foodCrisisData;
var foodCrisisDataframe;
var crisisDots;
var crisisByYear = {};
var reportedByYear;
var tableReportedByYear;

var renderSvg2 = function(){

d3.csv('data/foodSafetyCrisis20072015.csv', function(error, data){	
	foodCrisisData = data;

	var timeDomain = d3.extent(data, function(d){
		var date = chtDateToEng(d["發生或曝光時間"]);
		return parseTimeEn(date);
	});

	xScale2.domain(timeDomain);

	var yearMonth = [];
	for(var i = 0, n = dataframe["發布日期"].length; i < n; i++){
		yearMonth.push(dataframe["發布日期"][i].slice(0, 4));
	}
	reportedByYear = table(yearMonth);	
	tableReportedByYear = objectToArray(reportedByYear);
	yScale2.domain([
			0,
			d3.max(tableReportedByYear, function(d){
				return d.count;
			})
		]);


    line.x(function(d) { 
	    	return padding2.left + xScale2(parseTimeEn(d.category)); 
	    })
	    .y(function(d) { 
	    	return yScale2(d.count) - padding2.bottom; 
	    });


	svg2.append("path")
      .datum(tableReportedByYear)
      .attr("class", "line")
      .attr("d", line)
      .attr("fill", "none")
      .attr("stroke", "#fc8d59");


	foodCrisisDataframe = asDataframe(foodCrisisData);
	var yearSpan = [];
	for(var i = 0, n = foodCrisisDataframe["發生或曝光時間"].length; i < n; i++){
		var yearEn = chtDateToEng(foodCrisisDataframe["發生或曝光時間"][i]);
		yearSpan.push(yearEn);
	}
	var yearLevels = levels(yearSpan);
	for(var i = 0, n = yearLevels.length; i < n; i++){
		var yId = 0;
		for(var j = 0, m = foodCrisisData.length; j < m; j++){
			var date1 = yearLevels[i];
			var date2 = chtDateToEng(foodCrisisData[j]["發生或曝光時間"]);
			if(date1 == date2){
				foodCrisisData[j]["yId"] = yId;
				yId++;
			}
		}
	}

	crisisDots = svg2.selectAll("g")
		.data(foodCrisisData)
		.enter()
		.append("g");

	crisisDots.append("circle")				
		.attr("fill", "#bd0026")
		.attr("cx", function(d){
			var date = chtDateToEng(d["發生或曝光時間"]);
			return padding2.left + xScale2(parseTimeEn(date));
		})
		.attr("cy", function(d){
			return 540 - d.yId*16;
		})
		.attr("r", 6)
		.on("mouseenter", function(d){	
			appendCrisisTip(d);	
		})
		.on("mouseleave", function(d){
			svg2.selectAll(".tip")
				.remove();
		});

	svg2.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate("+ padding2.left + "," + (heightSvg2 - padding2.bottom) + ")")
		.call(xAxis2);
	svg2.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(" + padding2.left + "," + (- padding2.bottom) +")")
		.call(yAxis2);

	svg2.select(".x.axis")
		.selectAll("text")
		.data(tableReportedByYear)
		.on("mouseenter", function(d){		
			appendReportedTip(d);
		})
		.on("mouseleave", function(d){
			svg2.selectAll(".tip")
					.remove();
		});	


	svg2.append("circle")
		.attr("fill", "#bd0026")
		.attr("cx", 80)
		.attr("cy", 10)
		.attr("r", 6);
	svg2.append("text")
		.text("重大食安事件")
		.attr("x", 90)
		.attr("y", 16);
	svg2.append("line")
		.attr("x1", 190)
		.attr("x2", 206)
		.attr("y1", 10)
		.attr("y2", 10)
		.attr("stroke", "#fc8d59");
	svg2.append("text")
		.text("食品違規總件數")
		.attr("x", 210)
		.attr("y", 16);

});

};

var appendXAxisTip = function(d){
	var text1 = d.category;
	var text2 =  "總件數 : " + d.count;
	var tipWidth = textSize * text1.length;
	var tip = svg1.append("g")
				.attr("class", "tip");
	var rectHeight = 48;
			
	tip.append("path")		
		.attr("id", "tipShape")
		.attr("pointer-events", "none")
		.attr("d", function(){
			return createTipShape(
				xScale1(d.category) - tipWidth*0.5 - 2, heightSvg1 - 68,
				tipWidth + tipPadding*2, rectHeight,
				"bottom", 8, 8
			);
		});	

	appendTipText(tip, [text1, text2], 
					xScale1(d.category) - tipWidth*0.5 + tipPadding - 2, heightSvg1 - rectHeight + 2, 
					textSize, 14
	);	
}

var appendYAxisTip = function(d){
	var text1 = d.category;
	var text2 =  "總件數 : " + d.count;
	var tipWidth = textSize * d3.max([text1.length, text2.length]);
	var tip = svg1.append("g")
				.attr("class", "tip");
	var rectHeight = 48;

	tip.append("path")		
		.attr("id", "tipShape")
		.attr("pointer-events", "none")
		.attr("d", function(){
			return createTipShape(
				padding1.left, yScale1(d.category) - 16,
				tipWidth + tipPadding*2, rectHeight,
				"left", 8, 8
			);
		});	
	appendTipText(tip, [text1, text2], 
					padding1.left + tipPadding, yScale1(d.category) + 6, 
					textSize, 14
	);

}


var appendCellTip = function(d){
	var text1 = xVar + " : " + d[xVar];
	var text2 = yVar + " : " + d[yVar];
	var text3 = "件數 : " + d.count;
	var tipWidth = tipPadding*2 + textSize * d3.max([text1.length, text2.length, text3.length]);
	var tip = svg1.append("g")
				.attr("class", "tip");
	var tipHeight = 64;
	var yOffset = 72;
	var textOffset = 22;
	var lineHeight = textSize + 2;
	tip.append("path")
		.attr("id", "tipShape")
		.attr("pointer-events", "none")
		.attr("d", function(){
			return createTipShape(
				xScale1(d[xVar]) - tipWidth*0.5 + xScale1.rangeBand()*0.5, yScale1(d[yVar]) - yOffset,
				tipWidth, tipHeight,
				"bottom", 8, 8
			);
		});	

	appendTipText(tip, [text1, text2, text3], 
					xScale1(d[xVar]) - tipWidth*0.5 + tipPadding + xScale1.rangeBand()*0.5, yScale1(d[yVar]) - yOffset + textOffset, 
					textSize, lineHeight
	);
};

var appendCrisisTip = function(d){
	var text1 = "發生或曝光時間 : " + d["發生或曝光時間"];
	var text2 = "事件名稱 : " + d["事件名稱"];
	var tipWidth = tipPadding*2 + textSize * d3.max([text1.length, text2.length]);
	var tip = svg2.append("g")
				.attr("class", "tip");
	var tipHeight = 48;
	var yOffset = 56;
	var textOffset = 22;
	var lineHeight = textSize + 2;
	var date = chtDateToEng(d["發生或曝光時間"]);
	var xPos = padding2.left + xScale2(parseTimeEn(date));
	var yPos = 540 - d.yId*16 - 6;
	tip.append("path")
		.attr("id", "tipShape")
		.attr("pointer-events", "none")
		.attr("d", function(){
			return createTipShape(
				xPos - tipWidth*0.5, yPos - yOffset,
				tipWidth, tipHeight,
				"bottom", 8, 8
			);
		});	

	appendTipText(tip, [text1, text2], 
					xPos - tipWidth*0.5 + tipPadding, yPos - yOffset + textOffset, 
					textSize, lineHeight
	);
};

var appendReportedTip = function(d){
	var text1 = "年代 : " + d.category;
	var text2 = "已發布違規總件數 : " + d.count;
	var tipWidth = tipPadding*2 + textSize * d3.max([text1.length, text2.length]);
	var tip = svg2.append("g")
				.attr("class", "tip");
	var tipHeight = 48;
	var yOffset = 10;
	var textOffset = 22;
	var lineHeight = textSize + 2;
	var date = chtDateToEng(d.category);
	var xPos = padding2.left + xScale2(parseTimeEn(date));
	var yPos = heightSvg2 - yOffset;
	tip.append("path")
		.attr("id", "tipShape")
		.attr("pointer-events", "none")
		.attr("d", function(){
			return createTipShape(
				xPos - tipWidth*0.5, yPos,
				tipWidth, tipHeight,
				"top", 8, 8
			);
		});	

	appendTipText(tip, [text1, text2], 
					xPos - tipWidth*0.5 + tipPadding, yPos + textOffset, 
					textSize, lineHeight
	);
};

var appendTipText = function(parentNode, textArray, x, y, size, lineHeight){
	for(var i = 0, n = textArray.length; i < n; i++){
		parentNode.append("text")
				.text(textArray[i])
				.attr("pointer-events", "none")
				.attr("font-size", size + "px")
				.attr("x", function(){
					return x;
				})
				.attr("y", function(){
					return y + (i * lineHeight);
				});	
	}
};

var createTipShape = function(x, y, width, height, tailPosition, tailWidth, tailHeight){
	switch(tailPosition){
		case "right":
			return "M" + x + " " + y
			+ "L" + (x + width) + " " + y			
			+ "L" + (x + width) + " " + (y + 0.5*height - 0.5*tailWidth)
			+ "L" + (x + width + tailHeight) + " " + (y + 0.5*height)
			+ "L" + (x + width) + " " + (y + 0.5*height + 0.5*tailWidth)
			+ "L" + (x + width) + " " + (y + height)
			+ "L" + x + " " + (y + height)
			+ "L" + x + " " + y
			+ "Z";
			break;
		case "left":
			return "M" + x + " " + y
			+ "L" + (x + width) + " " + y
			+ "L" + (x + width) + " " + (y + height)
			+ "L" + x + " " + (y + height)
			+ "L" + x + " " + (y + 0.5*height + 0.5*tailWidth)
			+ "L" + (x - tailHeight) + " " + (y + 0.5*height)
			+ "L" + x + " " + (y + 0.5*height - 0.5*tailWidth)
			+ "L" + x + " " + y
			+ "Z";
			break;
		case "top":
			return "M" + x + " " + y
			+ "L" + (x + 0.5*width - 0.5*tailWidth) + " " + y
			+ "L" + (x + 0.5*width) + " " + (y - tailHeight)
			+ "L" + (x + 0.5*width + 0.5*tailWidth) + " " + y
			+ "L" + (x + width) + " " + y
			+ "L" + (x + width) + " " + (y + height)			
			+ "L" + x + " " + (y + height)
			+ "L" + x + " " + y
			+ "Z";
			break;		
		case "bottom":
			return "M" + x + " " + y
			+ "L" + (x + width) + " " + y
			+ "L" + (x + width) + " " + (y + height)
			+ "L" + (x + 0.5*width + 0.5*tailWidth) + " " + (y + height)
			+ "L" + (x + 0.5*width) + " " + (y + height + tailHeight)
			+ "L" + (x + 0.5*width - 0.5*tailWidth) + " " + (y + height)
			+ "L" + x + " " + (y + height)
			+ "L" + x + " " + y
			+ "Z";
			break;
	}	
};




var chtDateToEng = function(dateString){
	var str = dateString.replace("年", "-");
	str = str.replace("月", "-");
	str = str.replace("日", "");
	var strArray = str.split("-");
	str = strArray[0]; //
	return str;
};

