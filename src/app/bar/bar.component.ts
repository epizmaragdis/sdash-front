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
  private stack;
  private now;
  private start;
  private serie;
  private legend;
  private rect;
  private total;
  private keys;
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

    this.now = Moment.utc();
    this.start = Moment().subtract(55, 'minutes').utc();

    if (!this.config || this.config.length === 0 || !this.host) {
      return;
    }
    else {
      this.dataset.columns = Object.keys(this.config);
      this.config.date = this.now;
      this.dataset.push(this.config);

      // console.log(this.dataset);

      this.setup();
      this.buildSVG();
      this.populate();
    }

  }

  private setup(): void {
    this.margin = { top: 10, right: 10, bottom: 10, left: 10 };
    this.width = this.htmlElement.clientWidth - this.margin.left - this.margin.right;
    this.height = this.width * 0.4 - this.margin.top - this.margin.bottom;

    this.stack = D3.stack().offset(D3.stackOffsetExpand);

  }

  private buildSVG(): void {
    this.host.html('');
    this.svg = this.host.append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .append('g');

  }

  private populate(): void {

    var width = this.width - this.margin.right - this.margin.left;
    var height = this.height;

    var xScale = D3.scaleTime().range([20, this.width])
      .domain([this.start, this.now]);

    var zScale = D3.scaleOrdinal(['#1A4589','#9ADBF4','#007EA7  ','#EF233C', '#991B1E'])
      .domain(this.dataset.columns);

    // var zScale2 = D3.scaleOrdinal(['#CCC','#000','#f0f0f0','#cccccc'])
    //   .domain(this.dataset.columns);

    // var zScale = D3.scaleOrdinal(['positive','negative','#fdb9ae'])
    //   .domain(this.dataset.columns);

    var yScale = D3.scaleLinear().rangeRound([(this.height - 50), 10]);

    this.svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(" + 0 + "," + (this.height - 50) + ")")
      .call(D3.axisBottom(xScale));


    this.svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(30,0)")
      .call(D3.axisLeft(yScale).tickSize(-this.width).tickFormat(D3.format(".0%")));

    this.serie = this.svg.selectAll(".serie")
      .data(this.stack.keys(this.dataset.columns)(this.dataset))
      .enter().append("g")
      .attr("fill",  function(d) { return zScale(d.key); })
      .attr("stroke", function(d) { return zScale(d.key); })
      .attr("stroke-width", "2px");
      // .attr("stroke-opacity", 1)
      // .attr("stroke-width", 1)

    this.serie.selectAll("rect")
      .data(function(d) { return d; })
      .enter().append("rect")
      .attr("x", function(d) { return (xScale(d.data.date) - 20) ; })
      .attr("y", function(d) { return yScale(d[1]); })
      .attr("height", function(d) { return yScale(d[0]) - yScale(d[1]); })
      .attr("width", 20)
      .attr("opacity", "0.4")
      .attr("stroke-opacity","0")
      .attr("data-container", "body")
      .attr("data-toggle", "popover")
      .attr("data-trigger", "hover")
      .attr("data-placement","left")
      .attr("data-content", function(d) { return Math.round((d[1] - d[0]) * 100) + " %"; });


    this.serie.selectAll("line")
      .data(function(d) { return d; })
      .enter().append("line")
      .attr("x1", function(d) { return xScale(d.data.date) - 20; })
      .attr("y1", function(d) { return yScale(d[1]); })
      .attr("x2", function(d) { return xScale(d.data.date) })
      .attr("y2", function(d) { return yScale(d[1]); });
      // .attr("style", function(d) {
      //   return "stroke:" + zScale(d.fill) + ";stroke-width:2px";
      // });


    this.legend = this.svg.append("g")
      .selectAll("g")
      .data(this.dataset.columns.reverse())
      .enter().append("g")
      .attr("transform", function(d, i) { return "translate(" + i * 100 + "," + (height - 20) + ")"; });

    this.legend.append("rect")
      .attr("x", 0)
      .attr("width", 19)
      .attr("height", 19)
      .attr("fill", zScale);

    this.legend.append("text")
      .attr("class", "legend")
      .attr("x", 25)
      .attr("y", 9.5)
      .attr("dy", "0.32em")
      .text(function(d) { return d; });


    // Tooltip

    $(function () {
      $('[data-toggle="popover"]').popover()
    })

  }
}
