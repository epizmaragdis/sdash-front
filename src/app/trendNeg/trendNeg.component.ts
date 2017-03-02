import { Component, OnChanges, AfterViewInit, Input, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { TrendNegChartConfig } from './trendNeg.config';
import * as D3 from 'd3';
import * as Moment from 'moment';


@Component({
  selector: 'trendNeg-chart',
  templateUrl: './trendNeg.component.html',
  styleUrls: ['./trendNeg.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TrendNegComponent implements OnChanges, AfterViewInit {

  @Input() config: Array<TrendNegChartConfig>;
  @ViewChild('workarea') element: ElementRef;

  private host;
  private svg;
  private margin;
  private width;
  private height;
  private xScale;
  private yScale;
  private htmlElement: HTMLElement;
  private pack;
  private root;
  private node;

  constructor() { }

  ngAfterViewInit() {
    this.htmlElement = this.element.nativeElement;
    this.host = D3.select(this.htmlElement);
    this.setup();
  }

  ngOnChanges(): void {
    if (!this.config || this.config.length === 0 || !this.host) return;
    this.setup();
    this.buildSVG();
    this.populate();
  }

  private setup(): void {
    this.margin = { top: 10, right: 10, bottom: 10, left: 10 };
    this.width = this.htmlElement.clientWidth - this.margin.left - this.margin.right;
    this.height = this.width * 0.2 - this.margin.top - this.margin.bottom;

  }

  private buildSVG(): void {
    this.host.html('');
    this.svg = this.host.append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .append('g');

  }

  private populate(): void {

    // console.log(this.config.dataset);

    var entries = D3.nest()
      .key(function(d) { d.created_at.setMinutes(0); d.created_at.setSeconds(0); return d.created_at; })
      .rollup(function(d) { return d.length })
      .entries(this.config.dataset);


    var x = D3.scaleTime()
      .range([20, this.width-5])
      .domain(D3.extent(this.config.dataset, function(d) { return d.created_at; }));

    
    var max = D3.max(entries,  function(d) { return d.value; });

    var y = D3.scaleLinear()
      .range([(this.height - 20), 10])
      .domain([0, max]);

    var valueline = D3.line()
      .curve(D3.curveMonotoneX)
      .x(function(d) { return   x(new Date(d.key)); })
      .y(function(d) { return y(d.value); });

    // Add the X Axis
    this.svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + (this.height - 20) + ")")
      .call(D3.axisBottom(x));

    // Add the Y Axis
    this.svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(20,0)")
      .call(D3.axisLeft(y).ticks(5).tickSize(-this.width));

    this.svg.append("path")
      .data([entries])
      .attr("class", "line-neg")
      .attr("d", valueline);


    this.svg.selectAll("dot")
      .data(entries)
    .enter().append("circle")
      .attr("r", 3)
      .attr("class", "dot-neg")
      .attr("cx", function(d) { return x(new Date(d.key)); })
      .attr("cy", function(d) { return y(d.value); })
      .attr("data-container", "body")
      .attr("data-toggle", "popover")
      .attr("data-trigger", "hover")
      .attr("data-placement","top")
      .attr("data-html", "true")
      .attr("data-content", function(d) { return d.value + " Tweets<br>Fecha: " + d.key; });


    // var x = d3.scaleTime().range([0, this.width]);
    // var y = d3.scaleLinear().range([this.height, 0]);
    //
    // var valueline = d3.line()
    //   .x(function(d) { return x(d.date); })
    //   .y(function(d) { return y(d.close); });
    //
    // console.log(entries);

    // Tooltip

    $(function () {
      $('[data-toggle="popover"]').popover()
    })

  }
}
