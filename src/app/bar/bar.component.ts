import { Component, OnChanges, AfterViewInit, Input, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
// import { BarChartConfig } from './bar.config';
import * as D3 from 'd3';
import * as Moment from 'moment';


@Component({
  selector: 'bar-chart',
  templateUrl: './bar.component.html',
  styleUrls: ['./bar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BarComponent implements OnChanges, AfterViewInit {

  @Input() config;
  @ViewChild('workarea') element: ElementRef;



  private host;
  private svg;
  private margin;
  private width;
  private height;
  private htmlElement: HTMLElement;
  private dataset: any;
  private y;
  private x;
  private start;
  private serie;
  private legend;
  private rect;
  private total;
  private yAxis;
  private xAxis;

  constructor() {
    this.dataset = new Array<any>();
  }

  ngAfterViewInit() {
    this.htmlElement = this.element.nativeElement;
    this.host = D3.select(this.htmlElement);
    this.setup();
  }

  ngOnChanges(): void {


    if (!this.config || this.config.length === 0 || !this.host) {
      return;
    }
    else {

      this.setup();
      this.buildSVG();
      this.populate();
    }

  }

  private setup(): void {
    this.margin = { top: 10, right: 10, bottom: 10, left: 10 };
    this.width = this.htmlElement.clientWidth - this.margin.left - this.margin.right;
    this.height = this.width * 0.3 - this.margin.top - this.margin.bottom;

  }

  private buildSVG(): void {
    this.host.html('');
    this.svg = this.host.append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .append('g');

  }

  private populate(): void {
    // console.log(this.config);
    var data = D3.values(this.config);

    var max = D3.max(data, function(d){ return d.pos, d.neg});

    // console.log (max);
    //
    // console.log (data);

    var x = D3.scaleLinear()
        .range([this.margin.left, this.width - this.margin.right])
        .domain([-max - 5 , max + 5 ]);
      
    var y = D3.scaleBand()
              .rangeRound([0, this.height - this.margin.top*2.5, .2]);

    var xAxis = D3.axisTop(x);

    var yAxis = D3.axisRight(y)
                  .tickSize(0)
                  .tickPadding(6);



    y.domain(data.map(function (d) {
      return d.intent;

    }));

    this.svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "positive")
        .attr("x", function (d) { return x(Math.min(0, d.pos)); })
        .attr("y", function (d) { return y(d.intent);    })
        .attr("width", function (d) { return Math.abs(x(d.pos) - x(0)); })
        .attr("height", this.height/(data.length +2))
        .attr("transform", "translate(0," + this.margin.top*2.5 + ")")
        .attr("data-container", "body")
        .attr("data-toggle", "popover")
        .attr("data-trigger", "hover")
        .attr("data-placement","left")
        .attr("data-content", function(d) { return d.pos + " positivos"; });

    this.svg.selectAll(".bar2")
        .data(data)
        .enter().append("rect")
        .attr("class", "negative")
        .attr("x", function (d) { return x(Math.min(0, -d.neg)); })
        .attr("y", function (d) { return y(d.intent);  })
        .attr("width", function (d) { return Math.abs(x(-d.neg) - x(0)); })
        .attr("height", this.height/(data.length +2))
        .attr("transform", "translate(0," + this.margin.top*2.5 + ")")
        .attr("data-container", "body")
        .attr("data-toggle", "popover")
        .attr("data-trigger", "hover")
        .attr("data-placement","left")
        .attr("data-content", function(d) { return d.neg+ " negativos"; });


    this.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + this.margin.top*2.5 + ")")
        .call(xAxis)
        ;

    this.svg.append("g")
        .attr("class", "yAxis-bar")
        .attr("transform", "translate(" + this.width/2 + ", " + this.margin.top*2 + ")")
        .call (yAxis)
        ;

        // window.addEventListener('resize', function() {
        // console.log("The window was resized!");
        // });







  //   var width = this.width - this.margin.right - this.margin.left;
  //   var height = this.height;
  //
  //   var xScale = D3.scaleTime().range([20, this.width])
  //     .domain([this.start, this.now]);
  //
  //   var zScale = D3.scaleOrdinal(['#1A4589','#9ADBF4','#007EA7  ','#EF233C', '#991B1E'])
  //     .domain(this.dataset.columns);
  //
  //   var yScale = D3.scaleLinear().rangeRound([(this.height - 50), 10]);
  //
  //   this.svg.append("g")
  //     .attr("class", "x axis")
  //     .attr("transform", "translate(" + 0 + "," + (this.height - 50) + ")")
  //     .call(D3.axisBottom(xScale));
  //
  //   this.svg.append("g")
  //     .attr("class", "y axis")
  //     .attr("transform", "translate(30,0)")
  //     .call(D3.axisLeft(yScale).tickSize(-this.width).tickFormat(D3.format(".0%")));
  //
  //   this.serie = this.svg.selectAll(".serie")
  //     .data(this.stack.keys(this.dataset.columns)(this.dataset))
  //     .enter().append("g")
  //     .attr("fill",  function(d) { return zScale(d.key); })
  //     .attr("stroke", function(d) { return zScale(d.key); })
  //     .attr("stroke-width", "2px");
  //
  //
  //   this.serie.selectAll("rect")
  //     .data(function(d) { return d; })
  //     .enter().append("rect")
  //     .attr("x", function(d) { return (xScale(d.data.date) - 20) ; })
  //     .attr("y", function(d) { return yScale(d[1]); })
  //     .attr("height", function(d) { return yScale(d[0]) - yScale(d[1]); })
  //     .attr("width", 20)
  //     .attr("opacity", "0.4")
  //     .attr("stroke-opacity","0")

  //
  //
  //   this.serie.selectAll("line")
  //     .data(function(d) { return d; })
  //     .enter().append("line")
  //     .attr("x1", function(d) { return xScale(d.data.date) - 20; })
  //     .attr("y1", function(d) { return yScale(d[1]); })
  //     .attr("x2", function(d) { return xScale(d.data.date) })
  //     .attr("y2", function(d) { return yScale(d[1]); });
  //
  //
  //
  //   this.legend = this.svg.append("g")
  //     .selectAll("g")
  //     .data(this.dataset.columns.reverse())
  //     .enter().append("g")
  //     .attr("transform", function(d, i) { return "translate(" + i * 100 + "," + (height - 20) + ")"; });
  //
  //   this.legend.append("rect")
  //     .attr("x", 0)
  //     .attr("width", 19)
  //     .attr("height", 19)
  //     .attr("fill", zScale);
  //
  //   this.legend.append("text")
  //     .attr("class", "legend")
  //     .attr("x", 25)
  //     .attr("y", 9.5)
  //     .attr("dy", "0.32em")
  //     .text(function(d) { return d; });
  //
  //
    // Tooltip

    $(function () {
      $('[data-toggle="popover"]').popover()
    })

  }
}
