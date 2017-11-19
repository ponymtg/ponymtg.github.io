function Chart() {};

Chart.generatePieChart = function(selection, data, options) {
    var cultivatedData = Chart.cultivateData(data, options);
    var keys = cultivatedData.keys;
    var values = cultivatedData.values;

    var totalValue = Chart.getSumOfArrayValues(values);

    // Create an arc generator to generate path data according to our
    // specifications.
    var arcGenerator = d3.arc();

    // Set some default pie options. We won't set the outer radius yet, since
    // we might need to calculate it based on other figures that haven't been
    // derived yet.
    var params = {
        'width': options.width,
        'height': options.height,
        'innerRadius': 0,
        'strokeWidth': 2,
        'padding': {
            'x': 32,
            'y': 32,
        },
        'titleHeight': 0,
        'title': options.title,
    };

    if (options.innerRadius !== undefined) {
        params.innerRadius = options.innerRadius;
    }
    if (options.strokeWidth !== undefined) {
        params.strokeWidth = options.strokeWidth;
    }

    // Create a function to color pie sectors based on the index.
    var colorFunction = Chart.getChartColorFunction(options.colors, keys);

    // Create the SVG to hold the pie and add it to the specified DOM selection.
    var svg = selection
        .append('svg')
        .attr('width', params.width)
        .attr('height', params.height)
        .style('border', '1px solid rgb(0, 0, 0)');

    // If a title was specified, add it to the SVG.
    if (params.title !== undefined) {
        params.titleHeight = 48;
        var titleGroup = svg.append('g').classed('title', true);
        titleGroup
            .attr(
                'transform',
                'translate('
                    + (params.width / 2) + ', '
                    + (params.padding.y + 16)
                    + ')'
            );

            // If a title was defined in the options, add the title text.
            titleGroup.append('text')
                .attr('text-anchor', 'middle')
                .attr('font-size', '150%')
                .attr('font-weight', 'bold')
                .text(params.title);
    }

    // Create the chart area subgroup.
    var chartAreaGroup = svg.append('g').classed('chartArea', true);

    // Translate the chart area into position, taking into account any padding
    // and the space occupied by the title, if one was added.
    chartAreaGroup
        .attr(
            'transform',
            'translate('
                + params.padding.x + ', '
                + (params.padding.y + params.titleHeight)
                + ')'
        );

    // At this point we have enough information to definitively say how much
    // space is available for the chart area. (The chart area includes the
    // legend.
    params.chartAreaSize = {
        'x': params.width - (params.padding.x * 2),
        'y': params.height - params.titleHeight - (params.padding.y * 2),
    };

    // Now that we know the size of the chart area, we can set a reasonable
    // default for the pie's outer radius.
    params.outerRadius = params.chartAreaSize.y / 2;
    if (options.outerRadius !== undefined) {
        params.outerRadius = options.outerRadius;
    }

    // Set up the arc generator with the pie's radii,
    arcGenerator.innerRadius(params.innerRadius);
    arcGenerator.outerRadius(params.outerRadius);

    // Generate the path data to draw the pie chart, based on the data values.
    // Note that by default, d3's pie generator sorts the arc data by value;
    // however, this messes things up for us when we come to assign colors,
    // so we have to disable the sorting.
    var arcData = d3.pie().sort(null)(values);

    // If any patterns were specified in the colors options (ie. more than one
    // color specified for a key), set up the pattern here. The function
    // returned by `getChartColorFunction` will instruct the SVG to fill
    // the slice with a particular named pattern, so we have to make sure it
    // exists and is correct.
    //
    // Patterns are set up in the `<defs>` elements on the SVG.
    var defs = svg.append('defs');

    for (var k in options.colors) {
        var colorDefinition = options.colors[k];
        if (Array.isArray(colorDefinition)) {
            // This color definition has multiple colors in it, so it needs to
            // be a pattern.
            var patternWidth = 20;
            var patternHeight = 20;
            var stripeThickness = patternHeight / colorDefinition.length;
            var stripeRotation = -45;
            var pattern = defs.append('pattern')
                .attr('id', 'pattern-'+ k)
                .attr('width', patternWidth)
                .attr('height', patternHeight)
                .attr('patternUnits', 'userSpaceOnUse') 
                .attr('patternTransform', 'rotate('+stripeRotation+')');

        
            if (colorDefinition.length >= 2) {
                pattern.append('rect')
                    .attr('x', 0)
                    .attr('y', 0)
                    .attr('width', patternWidth/2)
                    .attr('height', patternHeight)
                    .attr('fill', colorDefinition[0]);
                pattern.append('rect')
                    .attr('x', patternWidth/2)
                    .attr('y', 0)
                    .attr('width', patternWidth/2)
                    .attr('height', patternHeight)
                    .attr('fill-opacity', 0.75)
                    .attr('fill', colorDefinition[1]);
            }

            if (colorDefinition.length >= 3) {
                pattern.append('rect')
                    .attr('x', 0)
                    .attr('y', 0)
                    .attr('width', patternWidth)
                    .attr('height', patternHeight/2)
                    .attr('fill-opacity', 0.75)
                    .attr('fill', colorDefinition[2]);
            }
        }
    }

    // Create the pie group and use the arc generator to supply geometry for an
    // SVG path representing the pie.
    var pieGroup = chartAreaGroup.append('g').classed('pie', true);

    pieGroup
        .attr(
            'transform',
            'translate('+params.outerRadius+', '+(params.chartAreaSize.y/2)+')'
        )
        .selectAll('path')
        .data(arcData)
        .enter()
        .append('path')
        .attr(
            'fill',
            function (arcDatum) {
                return colorFunction(arcDatum.index, keys);
            }
        )
        .attr('stroke', '#202020')
        .attr('stroke-width', params.strokeWidth)
        .attr('d', arcGenerator);

    // Add percentage labels at the centroid positions.
    pieGroup.append('g')
        .selectAll('g')
        .data(arcData)
        .enter()
        .append('g')
        .each(
            function(arcDatum) {
                var centroid = arcGenerator.centroid(arcDatum);
                var labelSize = {'x': 40, 'y': 24};
                var minAngle = (Math.PI * 2) / 60;
                if (arcDatum.endAngle - arcDatum.startAngle > minAngle) {
                    var group = d3.select(this);

                    group.append('rect')
                        .attr('x', centroid[0] - (labelSize.x / 2))
                        .attr('y', centroid[1] - (labelSize.y / 2))
                        .attr('width', labelSize.x)
                        .attr('height', labelSize.y)
                        .attr('rx', 8)
                        .attr('ry', 8)
                        .attr('fill-opacity', '0.75')
                        .attr('fill', '#202020');

                    group.append('text')
                        .attr('x', centroid[0])
                        .attr('y', centroid[1])
                        .attr('dy', '0.33em')
                        .attr('text-anchor', 'middle')
                        .attr('font-size', '75%')
                        .attr('font-weight', 'bold')
                        .attr('fill', '#e0e0e0')
                        .text(
                            ((arcDatum.data / totalValue) * 100).toFixed(1)+'%'
                        );
                }
            }
        );

    // Create the legend group and draw its rectangular border.

    // Calculate how much space is remaining for the legend (assuming it sits to
    // the right of the pie). The legend is a rectangular box containing a
    // vertical stack of items, one for each key.
    var legendOptions = {};
    legendOptions.margin = 32;
    legendOptions.width
        = params.chartAreaSize.x - (params.outerRadius * 2)
            - (legendOptions.margin * 2);
    legendOptions.height = params.chartAreaSize.y - (legendOptions.margin * 2);
    legendOptions.padding = 16;

    // There doesn't seem to be any reasonable way to vertically center SVG
    // text, so we have to add a vertical offset to make it look centered.
    legendOptions.textOffset = 14;

    // Calculate the vertical spacing between items. We put a max limit on the
    // spacing to prevent the legend from looking sparse and weird when there
    // aren't many items.
    legendOptions.maxItemSpacing = 32;
    legendOptions.itemSpacing = Math.min(
        (legendOptions.height - (legendOptions.padding * 2)) / keys.length,
        legendOptions.maxItemSpacing
    );

    // If it now turns out we could reduce the legend's height to fit the items,
    // calculate a new, shorter height.
    legendOptions.height
        = (legendOptions.itemSpacing*keys.length) + (legendOptions.padding*2);

    // Calculate the transform required to move the legend to its correct
    // location.
    legendOptions.x
        = (params.outerRadius * 2) + legendOptions.margin;
    legendOptions.y = 0;

    var legendGroup = chartAreaGroup.append('g').classed('legend', true);
    legendGroup
        .append('rect')
        .attr('stroke', 'rgb(32, 32, 32)')
        .attr('stroke-width', '1')
        .attr('fill', 'rgb(255, 255, 255)')
        .attr('width', legendOptions.width)
        .attr('height', legendOptions.height)

    // Translate the legend to its correct location.
    legendGroup
        .attr(
            'transform',
            'translate('
                + legendOptions.x + ', ' + legendOptions.y
            + ')'
        )

    // Add the legend items (color boxes and text labels).
    legendGroup
        .selectAll('g')
        .data(keys)
        .enter()
        .append('g')
        .each(
            function(key, index) {
                var legendItem = d3.select(this);
                // For each legend item, add the color box and the text label.
                var colorBoxOptions = {
                    'x': legendOptions.padding,
                    'y': (index * legendOptions.itemSpacing)
                        + legendOptions.padding,
                    'width': 20,
                    'height': 20,
                };

                var textLabelOffset = {
                    'x': colorBoxOptions.x + colorBoxOptions.width
                        + legendOptions.padding,
                    'y': (index * legendOptions.itemSpacing)
                        + legendOptions.padding
                        + legendOptions.textOffset,
                };

                var colorBox = legendItem.append('rect');

                colorBox
                    .attr('width', colorBoxOptions.width)
                    .attr('height', colorBoxOptions.height)
                    .attr('stroke', 'rgb(32, 32, 32)')
                    .attr('stroke-width', '1')
                    .attr(
                        'fill',
                        function (key) {
                            return colorFunction(index, keys);
                        }
                    )
                    .attr(
                        'transform',
                        'translate('
                            + colorBoxOptions.x + ','
                            + colorBoxOptions.y
                        + ')'
                    );

                legendItem
                    .append('text')
                    .text(key + ' (' + data[key] + ')')
                    .attr(
                        'transform',
                        'translate('
                            + textLabelOffset.x + ','
                            + textLabelOffset.y
                        + ')'
                    );
            }
        );
}

Chart.generateBarChart = function(selection, data, options) {
    var cultivatedData = Chart.cultivateData(data, options);
    var keys = cultivatedData.keys;
    var values = cultivatedData.values;

    // Set up the bar chart params, customized by the passed options if
    // needed.
    var params = Chart.parseBarChartOptions(options, keys, values);

    // Create the SVG to hold the chart and add it to the specified DOM
    // selection.
    var svg = selection
        .append('svg')
        .attr('width', params.svgWidth)
        .attr('height', params.svgHeight)
        .style('border', '1px solid rgb(0, 0, 0)');

    // Create the chart group. This represents the whole chart minus the
    // margins and title; ie. bars, axes, labels.
    var chart = svg.append('g')
        .attr(
            'transform',
            'translate('
                + params.dimensions.x.margin + ', '
                + (params.dimensions.y.margin
                + params.dimensions.y.title)
                + ')'
        );

    // Calculate the squeezed bar thickness (if squeezing was requested in the
    // options).
    var squeezedBarThickness = params.barThickness
        * params.barSqueezeCoefficient;

    // Add vertical guide lines at each x-axis tick.
    chart
        .append('g')
        .style('opacity', '0.1')
        .selectAll('line')
        .data(params.scales.x.ticks(keys.length))
        .enter()
        .append('line')
        .attr('stroke', 'rgb(0, 0, 0)')
        .attr('stroke-width', '1')
        .attr('x1', function(n) { return params.scales.x(n); })
        .attr('y1', 0)
        .attr('x2', function(n) { return params.scales.x(n); })
        .attr('y2', params.dimensions.y.chartArea)
        .attr(
            'transform', 'translate(' + params.dimensions.x.yAxisLabel + ', 0)'
        );
        
    // Add horizontal guide lines at each y-axis tick.
    chart
        .append('g')
        .style('opacity', '0.1')
        .selectAll('line')
        .data(params.scales.y.ticks())
        .enter()
        .append('line')
        .attr('stroke', 'rgb(0, 0, 0)')
        .attr('stroke-width', '1')
        .attr('x1', 0)
        .attr('y1', function(n) { return params.scales.y(n); })
        .attr('x2', params.dimensions.x.chartArea)
        .attr('y2', function(n) { return params.scales.y(n); })
        .attr(
            'transform', 'translate(' + params.dimensions.x.yAxisLabel + ', 0)'
        );
        
    if (params.title !== undefined) {
        // Add the title, if there is one. (The title is appended to the SVG
        // directly, so that it's independent of the chart area).
        svg.append('text')
            .attr('text-anchor', 'middle')
            .attr('font-size', '150%')
            .attr('font-weight', 'bold')
            .text(params.title)
            .attr(
                'transform',
                'translate('
                    + (params.svgWidth / 2) + ', '
                    + params.dimensions.y.margin
                    + ')'
            );
    }

    if (params.xAxisLabel !== undefined) {
        // Add the x-axis label to the chart area, if defined.
        chart.append('text')
            .attr('text-anchor', 'middle')
            .attr('font-size', '100%')
            .attr('font-weight', 'bold')
            .text(params.xAxisLabel)
            .attr(
                'transform',
                'translate('
                    + ((params.dimensions.x.yAxisLabel)
                    + (params.dimensions.x.chartArea / 2)) + ', '
                    + (params.dimensions.y.chartArea + 48)
                    + ')'
            );
    }

    if (params.yAxisLabel !== undefined) {
        // Add the y-axis label to the chart area, if defined.
        chart.append('text')
            .attr('text-anchor', 'middle')
            .attr('font-size', '100%')
            .attr('font-weight', 'bold')
            .text(params.yAxisLabel)
            .attr(
                'transform',
                'translate('
                    + '0, '
                    + (params.dimensions.y.chartArea / 2)
                    + ') rotate(-90)'
            );
    }

    // Add the chart bars.
    chart
        .append('g')
        .selectAll('rect')
        .data(keys)
        .enter()
        .append('rect')
        .attr(
            'x',
            function(key, index) {
                return params.scales.x(index)
                    + ((params.barThickness - squeezedBarThickness) / 2);
            }
        )
        .attr(
            'y',
            function(key) {
                return params.scales.y(data[key]);
            }
        )
        .attr('width', squeezedBarThickness)
        .attr(
            'height',
            function (key) {
                return params.dimensions.y.chartArea
                    - params.scales.y(data[key]);
            }
        )
        .attr(
            'fill',
            function (key, index) {
                return params.colorFunction(index, keys);
            }
        )
        .attr('stroke', '#202020')
        .attr('stroke-width', '1')
        .attr(
            'transform', 'translate(' + params.dimensions.x.yAxisLabel + ', 0)'
        );

    // Add the x-axis (making sure to translate it to the correct position)
    chart
        .append('g')
        .call(params.axisGenerators.x)
        .attr(
            'transform',
            'translate('
            + params.dimensions.x.yAxisLabel + ', '
            + params.dimensions.y.chartArea
            + ')'
        );
    // Add the y-axis.
    chart
        .append('g')
        .call(params.axisGenerators.y)
        .attr(
            'transform', 'translate(' + params.dimensions.x.yAxisLabel + ', 0)'
        );

    var labelRotation = 0;
    if (options.labelRotation !== undefined) {
        labelRotation = options.labelRotation;
    }

    // Add key labels for each bar.
    chart
        .append('g')
        .selectAll('g')
        .data(keys)
        .enter()
        .append('g')
        .each(
            function(key, index) {
                d3.select(this)
                    .append('text')
                    .text(key)
                    //.attr('font-size', '80%')
                    .attr('text-anchor', 'middle')
                    .attr(
                        'transform',
                        'translate('
                            + (params.scales.x(index)
                            + (params.barThickness / 2)) + ','
                            + params.dimensions.y.textOffset
                            + ') rotate(' + labelRotation + ')'
                    );
            }
        )
        .attr(
            'transform',
                'translate('
                + params.dimensions.x.yAxisLabel + ', '
                + params.dimensions.y.chartArea
                + ')'
        );

    // Add value labels at the top of each bar.
    chart
        .append('g')
        .selectAll('g')
        .data(keys)
        .enter()
        .append('g')
        .each(
            function(key, index) {
                d3.select(this)
                    .append('text')
                    .text(data[key])
                    .attr('font-weight', 'bold')
                    .attr('text-anchor', 'middle')
                    .attr(
                        'transform',
                        'translate('
                            + (params.scales.x(index)
                            + (params.barThickness / 2)) + ','
                            + (params.scales.y(data[key]) - 8)
                            + ')'
                    );
            }
        )
        .attr(
            'transform',
                'translate('
                + params.dimensions.x.yAxisLabel + ', 0'
                + ')'
        );
}

Chart.generateHorizontalBarChart = function(selection, data, options) {
    var cultivatedData = Chart.cultivateData(data, options);
    var keys = cultivatedData.keys;
    var values = cultivatedData.values;

    var largestValue = Chart.getMaxValueInArray(values);

    var params = Chart.parseBarChartOptions(options, keys, values, 'horizontal');

    // Create the chart SVG.
    var svg = selection
        .append('svg')
        .attr('width', params.svgWidth)
        .attr('height', params.svgHeight)
        .style('border', '1px solid rgb(0, 0, 0)');

    var chart = svg.append('g')
        .attr(
            'transform',
            'translate('
                + params.dimensions.x.margin + ', '
                + (params.dimensions.y.margin
                + params.dimensions.y.title)
                + ')'
        );

    var squeezedBarThickness = params.barThickness
        * params.barSqueezeCoefficient;

    // Add vertical guide lines at each x-axis tick.
    chart
        .append('g')
        .style('opacity', '0.1')
        .selectAll('line')
        .data(params.scales.x.ticks())
        .enter()
        .append('line')
        .attr('stroke', 'rgb(0, 0, 0)')
        .attr('stroke-width', '1')
        .attr('x1', function(n) { return params.scales.x(n); })
        .attr('y1', 0)
        .attr('x2', function(n) { return params.scales.x(n); })
        .attr('y2', params.dimensions.y.chartArea)
        .attr(
            'transform', 'translate(' + params.dimensions.x.yAxisLabel + ', 0)'
        );
        
    // Add horizontal guide lines at each y-axis tick.
    chart
        .append('g')
        .style('opacity', '0.1')
        .selectAll('line')
        .data(params.scales.y.ticks(keys.length))
        .enter()
        .append('line')
        .attr('stroke', 'rgb(0, 0, 0)')
        .attr('stroke-width', '1')
        .attr('x1', 0)
        .attr('y1', function(n) { return params.scales.y(n); })
        .attr('x2', params.dimensions.x.chartArea)
        .attr('y2', function(n) { return params.scales.y(n); })
        .attr(
            'transform', 'translate(' + params.dimensions.x.yAxisLabel + ', 0)'
        );
        
    if (params.title !== undefined) {
        // Add the title, if there is one. (The title is appended to the SVG
        // directly, so that it's independent of the chart area).
        svg.append('text')
            .attr('text-anchor', 'middle')
            .attr('font-size', '150%')
            .attr('font-weight', 'bold')
            .text(params.title)
            .attr(
                'transform',
                'translate('
                    + (params.svgWidth / 2) + ', '
                    + params.dimensions.y.margin
                    + ')'
            );
    }

    if (params.xAxisLabel !== undefined) {
        // Add the x-axis label to the chart area, if defined.
        chart.append('text')
            .attr('text-anchor', 'middle')
            .attr('font-size', '100%')
            .attr('font-weight', 'bold')
            .text(params.xAxisLabel)
            .attr(
                'transform',
                'translate('
                    + ((params.dimensions.x.yAxisLabel)
                    + (params.dimensions.x.chartArea / 2)) + ', '
                    + (params.dimensions.y.chartArea + 48)
                    + ')'
            );
    }

    if (params.yAxisLabel !== undefined) {
        // Add the y-axis label to the chart area, if defined.
        chart.append('text')
            .attr('text-anchor', 'middle')
            .attr('font-size', '100%')
            .attr('font-weight', 'bold')
            .text(params.yAxisLabel)
            .attr(
                'transform',
                'translate('
                    + '0, '
                    + (params.dimensions.y.chartArea / 2)
                    + ') rotate(-90)'
            );
    }

    // Add vertical guide lines at each x-axis tick.
    svg
        .append('g')
        .style('opacity', '0.1')
        .attr(
            'transform',
            'translate('
                + params.dimensions.x.margin + ', '
                + params.dimensions.y.margin
                + ')'
        )
        .selectAll('line')
        .data(params.scales.x.ticks())
        .enter()
        .append('line')
        .attr('stroke', 'rgb(0, 0, 0)')
        .attr('stroke-width', '1')
        .attr('x1', function(n) { return params.scales.x(n); })
        .attr('y1', 0)
        .attr('x2', function(n) { return params.scales.x(n); })
        .attr('y2', params.height);
        
    // Add horizontal guide lines at each y-axis tick.
    svg
        .append('g')
        .style('opacity', '0.1')
        .attr(
            'transform',
            'translate('
                + params.dimensions.x.margin + ', '
                + params.dimensions.y.margin
                + ')'
        )
        .selectAll('line')
        .data(params.scales.y.ticks())
        .enter()
        .append('line')
        .attr('stroke', 'rgb(0, 0, 0)')
        .attr('stroke-width', '1')
        .attr('x1', 0)
        .attr('y1', function(n) { return params.scales.y(n); })
        .attr('x2', params.width)
        .attr('y2', function(n) { return params.scales.y(n); });
        

    // Calculate the bar thickness, squeezed and unsqueezed.
    var squeezedBarThickness = params.barThickness *
        params.barSqueezeCoefficient;

    chart
        .append('g')
        .selectAll('rect')
        .data(keys)
        .enter()
        .append('rect')
        .attr(
            'x',
            function(key) {
                return 0;
            }
        )
        .attr(
            'y',
            function(key, index) {
                return params.scales.y(index)
                    + ((params.barThickness - squeezedBarThickness) / 2);
            }
        )
        .attr(
            'width',
            function (key) {
                return params.scales.x(data[key]);
            }
        )
        .attr('height', squeezedBarThickness)
        .attr(
            'fill',
            function (key, index) {
                return params.colorFunction(index, keys);
            }
        )
        .attr('stroke', '#202020')
        .attr('stroke-width', '1')
        .attr(
            'transform', 'translate(' + params.dimensions.x.yAxisLabel + ', 0)'
        );

    // Add the x-axis (making sure to translate it to the correct position)
    chart
        .append('g')
        .call(params.axisGenerators.x)
        .attr(
            'transform',
            'translate('
            + params.dimensions.x.yAxisLabel + ', 0'
            + ')'
        );
    // Add the y-axis.
    chart
        .append('g')
        .call(params.axisGenerators.y)
        .attr(
            'transform', 'translate(' + params.dimensions.x.yAxisLabel + ', 0)'
        );

    // Add key labels for each bar.
    chart
        .append('g')
        .selectAll('g')
        .data(keys)
        .enter()
        .append('g')
        .each(
            function(key, index) {
                d3.select(this)
                    .append('text')
                    .text(key)
                    .attr('font-size', '90%')
                    .attr('text-anchor', 'end')
                    .attr(
                        'transform',
                        'translate('
                            + '-8, '
                            + (params.scales.y(index)
                            + (params.barThickness / 2) + 4)
                            + ')'
                    );
            }
        )
        .attr(
            'transform',
                'translate('
                + params.dimensions.x.yAxisLabel + ', 0)'
        );

    // Add value labels at the end of each bar.
    chart
        .append('g')
        .selectAll('g')
        .data(keys)
        .enter()
        .append('g')
        .each(
            function(key, index) {
                d3.select(this)
                    .append('text')
                    .text(data[key])
                    .attr('font-weight', 'bold')
                    .attr(
                        'transform',
                        'translate('
                            + (params.scales.x(data[key]) + 8) + ','
                            + (params.scales.y(index)
                            + (params.barThickness / 2)
                            + (params.dimensions.y.textOffset * 0.3))
                            + ')'
                    );
            }
        );
}

/**
 * Generate a bubble chart from the supplied data.
 *
 * Bubble charts represent 3-dimensional data; each bubble is positioned at an
 * x and y coordinate, and the z dimension is represented by the bubble's size.
 *
 * @param selection A D3 element selection to which the chart will be appended.
 * @param object data A dataset.
 * @param function extractionFunction A function to extract 3-tuples from data.
 * @param object options An array of chart options.
 */
Chart.generateBubbleChart = function(
    selection,
    data,
    extractionFunction,
    options
) {
    // Extract an array of 3-tuples from the data, representing the x, y, and z
    // values that we will be plotting on the chart. (x and y are coordinates;
    // z is bubble size).
    var tuples = extractionFunction(data);

    // Get the largest values of each tuple coordinate. We'll need these to
    // appropriately scale the chart and bubbles.
    var largestValues = {
        'x': Chart.getMaxValueInArray(
            tuples.map(function(tuple){ return tuple[0]; })
        ),
        'y': Chart.getMaxValueInArray(
            tuples.map(function(tuple){ return tuple[1]; })
        ),
        'z': Chart.getMaxValueInArray(
            tuples.map(function(tuple){ return tuple[2]; })
        ),
    };

    // Parse the options to obtain useful parameters and dimensions with which
    // to construct the chart.
    var params = Chart.parse2dChartOptions(options);

    // Define scales for each axis.
    params.scales = {};

    params.scales.x = d3.scaleLinear()
        .domain([0, largestValues.x])
        .range([0, params.dimensions.x.chartArea]);
    params.scales.y = d3.scaleLinear()
        .domain([0, largestValues.y])
        .range([params.dimensions.y.chartArea, 0]);
    params.scales.z = d3.scaleSqrt()
        .domain([0, largestValues.z])
        .range([0,  1]);

    // Create an axis generator for each axis.
    params.axisGenerators = {};

    params.axisGenerators.x = d3.axisBottom(params.scales.x)
    params.axisGenerators.y = d3.axisLeft(params.scales.y);

    // Create the SVG to hold the chart and add it to the specified DOM
    // selection.
    var svg = selection
        .append('svg')
        .attr('width', params.svgWidth)
        .attr('height', params.svgHeight)
        .style('border', '1px solid rgb(0, 0, 0)');

    // Create the chart group.
    var chartAreaGroup = svg.append('g')
        .attr(
            'transform',
            'translate('
                + params.dimensions.x.padding + ', '
                + (params.dimensions.y.padding
                + params.dimensions.y.title)
                + ')'
        );

    // Add vertical guide lines at each x-axis tick.
    chartAreaGroup
        .append('g')
        .style('opacity', '0.1')
        .selectAll('line')
        .data(params.scales.x.ticks())
        .enter()
        .append('line')
        .attr('stroke', 'rgb(0, 0, 0)')
        .attr('stroke-width', '1')
        .attr('x1', function(n) { return params.scales.x(n); })
        .attr('y1', 0)
        .attr('x2', function(n) { return params.scales.x(n); })
        .attr('y2', params.dimensions.y.chartArea)
        .attr(
            'transform', 'translate(' + params.dimensions.x.yAxisLabel + ', 0)'
        );
        
    // Add horizontal guide lines at each y-axis tick.
    chartAreaGroup
        .append('g')
        .style('opacity', '0.1')
        .selectAll('line')
        .data(params.scales.y.ticks())
        .enter()
        .append('line')
        .attr('stroke', 'rgb(0, 0, 0)')
        .attr('stroke-width', '1')
        .attr('x1', 0)
        .attr('y1', function(n) { return params.scales.y(n); })
        .attr('x2', params.dimensions.x.chartArea)
        .attr('y2', function(n) { return params.scales.y(n); })
        .attr(
            'transform', 'translate(' + params.dimensions.x.yAxisLabel + ', 0)'
        );
        
    if (params.title !== undefined) {
        // Add the title, if there is one. (The title is appended to the SVG
        // directly, so that it's independent of the chart area).
        svg.append('text')
            .attr('text-anchor', 'middle')
            .attr('font-size', '150%')
            .attr('font-weight', 'bold')
            .text(params.title)
            .attr(
                'transform',
                'translate('
                    + (params.svgWidth / 2) + ', '
                    + params.dimensions.y.padding
                    + ')'
            );
    }

    // Add the x-axis (making sure to translate it to the correct position)
    chartAreaGroup
        .append('g')
        .call(params.axisGenerators.x)
        .attr(
            'transform',
            'translate('
            + params.dimensions.x.yAxisLabel + ', '
            + params.dimensions.y.chartArea
            + ')'
        );
    // Add the y-axis.
    chartAreaGroup
        .append('g')
        .call(params.axisGenerators.y)
        .attr(
            'transform', 'translate(' + params.dimensions.x.yAxisLabel + ', 0)'
        );
    if (params.xAxisLabel !== undefined) {
        // Add the x-axis label to the chart area, if defined.
        chartAreaGroup.append('text')
            .attr('text-anchor', 'middle')
            .attr('font-size', '100%')
            .attr('font-weight', 'bold')
            .text(params.xAxisLabel)
            .attr(
                'transform',
                'translate('
                    + ((params.dimensions.x.yAxisLabel)
                    + (params.dimensions.x.chartArea / 2)) + ', '
                    + (params.dimensions.y.chartArea + 48)
                    + ')'
            );
    }

    if (params.yAxisLabel !== undefined) {
        // Add the y-axis label to the chart area, if defined.
        chartAreaGroup.append('text')
            .attr('text-anchor', 'middle')
            .attr('font-size', '100%')
            .attr('font-weight', 'bold')
            .text(params.yAxisLabel)
            .attr(
                'transform',
                'translate('
                    + '0, '
                    + (params.dimensions.y.chartArea / 2)
                    + ') rotate(-90)'
            );
    }

    // Add the bubbles.
    chartAreaGroup
        .append('g')
        .selectAll('circle')
        .data(tuples)
        .enter()
        .append('circle')
        .attr(
            'cx',
            function(key, index) {
                return params.scales.x(key[0]);
            }
        )
        .attr(
            'cy',
            function(key) {
                return params.scales.y(key[1]);
            }
        )
        .attr(
            'r',
            function(key) {
                return 7 + (12 * params.scales.z(key[2]));
            }
            
        )
        .attr('fill-opacity', '0.9')
        .attr(
            'fill',
            function (key, index) {
                return 'rgb(0, 0, 0)'; //params.colorFunction(index, keys);
            }
        )
        .attr(
            'transform', 'translate(' + params.dimensions.x.yAxisLabel + ', 0)'
        );

    chartAreaGroup
        .append('g')
        .selectAll('text')
        .data(tuples)
        .enter()
        .append('text')
        .attr(
            'x',
            function(key, index) {
                return params.scales.x(key[0]);
            }
        )
        .attr(
            'y',
            function(key) {
                return params.scales.y(key[1]);
            }
        )
        .attr(
            'font-size',
            function(key) {
                return 70 + (40 * params.scales.z(key[2]))+ '%';
            }
        )
        .text(
            function(key) {
                return key[2];
            }
        )
        .attr(
            'fill',
            function (key, index) {
                return 'rgb(255, 255, 255)'; //params.colorFunction(index, keys);
            }
        )
        .attr('dy', 4)
        .attr('font-weight', 'bold')
        .attr('text-anchor', 'middle')
        .attr(
            'transform', 'translate(' + params.dimensions.x.yAxisLabel + ', 0)'
        );

}

/**
 * Given a set of options to a 2D chart, parse it and compute various useful
 * parameters from which the chart can be generated, supplying defaults where
 * options haven't been specified. This mostly calculates things like the
 * dimensions of the different parts of the chart.
 *
 * The function also needs to know the largest x and y values on each axis in
 * order to return appropriately-scaled axes.
 *
 * @param object options
 * @param int|float xMax
 * @param int|float yMax
 */
Chart.parse2dChartOptions = function(options, xMax, yMax) {
    var params = {};

    /**
     * The width and height of the entire SVG.
     */
    params.svgWidth = 800;
    params.svgHeight = 450;

    if (options.width !== undefined) {
        params.svgWidth = options.width;
    }
    if (options.height !== undefined) {
        params.svgHeight = options.height;
    }

    /**
     * An object containing the x- and y- dimensions of various elements of the
     * chart, to make it easier to sum offsets when we're trying to figure out
     * where something should be positioned.
     */
    params.dimensions = {
        'x': {},
        'y': {},
    };

    /**
     * The title of the chart, if defined.
     */
    params.title = undefined;

    /**
     * The amount of vertical space taken up by the title.
     */
    params.dimensions.y.title = 0;

    if (options.title !== undefined) {
        params.title = options.title;
        params.dimensions.y.title = 64;
    }

    /**
     * The chart's x-axis label, if defined.
     */
    params.xAxisLabel = undefined;

    /**
     * The amount of vertical space taken up by the x-axis label.
     */
    params.dimensions.y.xAxisLabel = 0;

    if (options.axisLabels !== undefined) {
        if (options.axisLabels.x !== undefined) {
            params.xAxisLabel = options.axisLabels.x;
            params.dimensions.y.xAxisLabel = 40;
        }
    }

    /**
     * The chart's y-axis label, if defined.
     */
    params.yAxisLabel = undefined;

    /**
     * The amount of horizontal space taken up by the y-axis label.
     */
    params.dimensions.x.yAxisLabel = 0;

    if (options.axisLabels !== undefined) {
        if (options.axisLabels.y !== undefined) {
            params.yAxisLabel = options.axisLabels.y;
            params.dimensions.x.yAxisLabel = 64;
        }
    }

    /**
     * The amount of horizontal and vertical space between each edge of the
     * whole chart and the SVG bounds.
     */
    params.dimensions.x.padding = 48;
    params.dimensions.y.padding = 48;

    if (options.padding) {
        if (options.padding.x !== undefined) {
            params.dimensions.x.padding = options.padding.x;
        }
        if (options.padding.y !== undefined) {
            params.dimensions.y.padding = options.padding.y;
        }
    }

    /**
     * The dimensions of the chart area containing the bars, axes, and labels.
     */
    params.dimensions.x.chartArea = params.svgWidth
        - (params.dimensions.x.padding * 2) - params.dimensions.x.yAxisLabel;
    params.dimensions.y.chartArea = params.svgHeight
        - (params.dimensions.y.padding * 2) - params.dimensions.y.title
        - params.dimensions.y.xAxisLabel;

    /**
     * It's annoyingly hard to vertically align SVG text because there's no
     * easy way to obtain the height of a piece of text. Here, we'll just define
     * how much to vertically offset text by and hope that's good enough.
     */
    params.dimensions.y.textOffset = 16;

    return params;
}

/**
 * Given a set of options to a bar chart, parse it and compute various useful
 * parameters from which the chart can be generated, supplying defaults where
 * options haven't been specified.
 *
 * @param object options
 * @param string[] keys The chart keys.
 * @param string orientation "horizontal", "vertical"
 */
Chart.parseBarChartOptions = function(options, keys, values, orientation) {
    if (orientation === undefined) {
        orientation = 'vertical';
    }

    // Obtain the largest value in the dataset. We'll need this to scale the
    // bars appropriately.
    var largestValue = Chart.getMaxValueInArray(values);

    var params = {};

    /**
     * The width and height of the entire SVG.
     */
    params.svgWidth = 800;
    params.svgHeight = 450;

    if (options.width !== undefined) {
        params.svgWidth = options.width;
    }
    if (options.height !== undefined) {
        params.svgHeight = options.height;
    }

    /**
     * An object containing the x- and y- dimensions of various elements of the
     * chart, to make it easier to sum offsets when we're trying to figure out
     * where something should be positioned.
     */
    params.dimensions = {
        'x': {},
        'y': {},
    };

    /**
     * The title of the chart, if defined.
     */
    params.title = undefined;

    /**
     * The amount of vertical space taken up by the title.
     */
    params.dimensions.y.title = 0;

    if (options.title !== undefined) {
        params.title = options.title;
        params.dimensions.y.title = 64;
    }

    /**
     * The chart's x-axis label, if defined.
     */
    params.xAxisLabel = undefined;

    /**
     * The amount of vertical space taken up by the x-axis label.
     */
    params.dimensions.y.xAxisLabel = 0;

    if (options.axisLabels !== undefined) {
        if (options.axisLabels.x !== undefined) {
            params.xAxisLabel = options.axisLabels.x;
            params.dimensions.y.xAxisLabel = 40;
        }
    }

    /**
     * The chart's y-axis label, if defined.
     */
    params.yAxisLabel = undefined;

    /**
     * The amount of horizontal space taken up by the y-axis label.
     */
    params.dimensions.x.yAxisLabel = 0;

    if (options.axisLabels !== undefined) {
        if (options.axisLabels.y !== undefined) {
            params.yAxisLabel = options.axisLabels.y;
            params.dimensions.x.yAxisLabel = 64;
        }
    }

    /**
     * The amount of horizontal and vertical space between each edge of the
     * whole chart and the SVG bounds.
     */
    params.dimensions.x.margin = 48;
    if (orientation === 'horizontal') {
        params.dimensions.x.margin = 96;
    }
    params.dimensions.y.margin = 48;

    if (options.margin) {
        if (options.margin.x !== undefined) {
            params.dimensions.x.margin = options.margin.x;
        }
        if (options.margin.y !== undefined) {
            params.dimensions.y.margin = options.margin.y;
        }
    }

    /**
     * The dimensions of the chart area containing the bars, axes, and labels.
     */
    params.dimensions.x.chartArea = params.svgWidth
        - (params.dimensions.x.margin * 2) - params.dimensions.x.yAxisLabel;
    params.dimensions.y.chartArea = params.svgHeight
        - (params.dimensions.y.margin * 2) - params.dimensions.y.title
        - params.dimensions.y.xAxisLabel;

    /**
     * A coefficient which determines how much the thickness of the bar is
     * reduced when displayed; for example, a value of 0.5 means the bar is half
     * the width it would be otherwise.
     */
    params.barSqueezeCoefficient = 0.8;

    /**
     * It's annoyingly hard to vertically align SVG text because there's no
     * easy way to obtain the height of a piece of text. Here, we'll just define
     * how much to vertically offset text by and hope that's good enough.
     */
    params.dimensions.y.textOffset = 16;

    // Define scales for each axis.
    params.scales = {};

    // Create an axis generator for each axis.
    params.axisGenerators = {};

    /** The thickness (ie. width or height) of each bar in the chart. */
    params.barThickness = undefined;

    if (orientation === 'horizontal') {
        params.barThickness = params.dimensions.y.chartArea / keys.length;

        params.scales.x = d3.scaleLinear()
            .domain([0, largestValue])
            .range([0, params.dimensions.x.chartArea]);

        params.scales.y = d3.scaleLinear()
            .domain([0, keys.length])
            .range([0, params.dimensions.y.chartArea]);

        // For the key axis we're hacking it a little to get tick marks at the
        // points between each bar, and disabling the index labels so that we
        // can add in our text labels manually.
        params.axisGenerators.x = d3.axisTop(params.scales.x);
        params.axisGenerators.y = d3.axisLeft(params.scales.y)
            .ticks(keys.length)
            .tickFormat('');

    } else if (orientation === 'vertical') {
        params.barThickness = params.dimensions.x.chartArea / keys.length;

        params.scales.x = d3.scaleLinear()
            .domain([0, keys.length])
            .range([0, params.dimensions.x.chartArea]);
        params.scales.y = d3.scaleLinear()
            .domain([0, largestValue])
            .range([params.dimensions.y.chartArea, 0]);

        params.axisGenerators.x = d3.axisBottom(params.scales.x)
            .ticks(keys.length)
            .tickFormat('');
        params.axisGenerators.y = d3.axisLeft(params.scales.y);
    }

    // Create a function to color bars based on their index.
    params.colorFunction = Chart.getChartColorFunction(options.colors, keys);

    return params;
}

/**
 * Given a dataset in the form of key-value pairs, apply some transformations to
 * turn it an array of keys and an array of corresponding values, applying
 * sorting and limiting if requested.
 */
Chart.cultivateData = function(data, options) {
    var keys = Object.keys(data);

    var sortFunction = Sort.objectByValue;
    switch (options.sortBy) {
        case 'key':
            sortFunction = Sort.objectByKey;
            break;
        case 'value':
            sortFunction = Sort.objectByValue;
            break;
    }

    if (options.order !== undefined) {
        keys = sortFunction(data, options.order);
    }

    if (options.limit !== undefined) {
        keys = keys.slice(0, options.limit);
    }

    var values = [];
    for (var i=0; i < keys.length; i++) {
        values.push(data[keys[i]]);
    }

    return {
        'keys': keys,
        'values': values,
    };
}

/**
 * Given a variable that contains a definition of how to color a chart, return
 * a function that can be used to color the chart at each data index.
 *
 * The color definition can be given in multiple ways:
 *
 * - as a string ('#0080ff')
 * - as a function which returns color strings
 * - as an associative array of keys to colors
 */
Chart.getChartColorFunction = function(colorsDefinition, keys) {
    switch(typeof colorsDefinition) {
        case 'function':
            // If a function is passed, just use that for generating colors.
            return colorsDefinition;
            break;
        case 'string':
            // If a string is passed, assume that it's specifying a single
            // color.
            return function(index) {
                return colorsDefinition;
            }
            break;
        case 'object':
            // If an object is passed, we allow 2 possible interpretations:
            //
            // 1. If a key of the object is associated with a string (eg.
            //    "{'Applejack': '#ff8040'}") we assume that the object is
            //    supplying a color value for each key value, and simply return
            //    the value for that key.
            // 2. If a key of the object is associated with an _array_, we
            //    assume that the object is supplying a stripe pattern
            //    definition for that key, and will just return a pattern url
            //    string (eg. "url('pattern-Applejack')". The chart itself will
            //    set up and supply the pattern.
            return function(index) {
                if (colorsDefinition[keys[index]] !== undefined) {
                    if (Array.isArray(colorsDefinition[keys[index]])) {
                        return 'url(#pattern-' + keys[index] + ')';
                    }
                        
                    return colorsDefinition[keys[index]];
                }
            }
            break;
    }

    return function(index) {
        return 'rgb(128, 128, 128)';
    }
}
        
/**
 * Elegant solution from <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/max#Getting_the_maximum_element_of_an_array>
 */
Chart.getMaxValueInArray = function(values) {
    return values.reduce(
        function(accumulator, value) {
            return Math.max(accumulator, value);
        }
    );
}

Chart.getSumOfArrayValues = function(values) {
    return values.reduce(
        function(accumulator, value) {
            return accumulator + value;
        }
    );
}

