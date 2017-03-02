import { Component, OnChanges, AfterViewInit, Input, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { TrendChartConfig } from './trend.config';
import * as D3 from 'd3';
import * as Moment from 'moment';


@Component({
  selector: 'trend-chart',
  templateUrl: './trend.component.html',
  styleUrls: ['./trend.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TrendComponent implements OnChanges, AfterViewInit {

  @Input() config: Array<TrendChartConfig>;
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
    this.height = this.width * 0.25 - this.margin.top - this.margin.bottom;

  }

  private buildSVG(): void {
    this.host.html('');
    this.svg = this.host.append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .append('g');

  }

  private populate(): void {

    var pos = this.config.dataset.filter(d=> {return d.score > 0 });

    var neg = this.config.dataset.filter(d=> {return d.score <= 0 });

      var entriesPos = D3.nest()
      .key(function(d) { d.created_at.setMinutes(0); d.created_at.setSeconds(0); return d.created_at; })
      .rollup(function(d) { return d.length })
      .entries(pos);

    var entriesNeg = D3.nest()
      .key(function(d) { d.created_at.setMinutes(0); d.created_at.setSeconds(0); return d.created_at; })
      .rollup(function(d) { return d.length })
      .entries(neg);

    var x = D3.scaleTime()
      .range([20, this.width-5])
      .domain(D3.extent(this.config.dataset, function(d) { return d.created_at; }));

    // var max = D3.max(entries,  function(d) { return d.value; });
    var maxPos = D3.max(entriesPos,  function(d) { return d.value; });
    var maxNeg = D3.max(entriesNeg,  function(d) { return d.value; });
    if(maxPos > maxNeg){
      var max = maxPos;
    }else {
      var max = maxNeg;
    };


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
      .data([entriesPos])
      .attr("class", "line")
      .attr("id", "linePos")
      .attr("d", valueline)
      .on("mouseover", function (){
        D3.selectAll("#lineNeg").style("stroke-opacity", 0.2);
        D3.selectAll(".dot-neg").style("stroke-opacity", 0).style("fill", "none");
      })
      .on("mouseout", function (){
          D3.selectAll("#lineNeg").style("stroke-opacity", 1);
          D3.selectAll(".dot-neg").style("stroke-opacity", 1).style("fill", "#e3f5dd");
     })
      .on("click", function(){
       // determine if current line is visible
       var active   = lineNeg.active ? false : true,
       newOpacity = active ? 0 : 1;
       // hide or show the elements
       D3.selectAll("#lineNeg").style("opacity", newOpacity);
       // update whether or not the elements are active
       lineNeg.active = active; })
      ;

      this.svg.selectAll("dot")
        .data(entriesPos)
        .enter().append("circle")
        .attr("r", 3)
        .attr("class", "dot")
        .attr("id", "linePos")
        .attr("cx", function(d) { return x(new Date(d.key)); })
        .attr("cy", function(d) { return y(d.value); })
        .attr("data-container", "body")
        .attr("data-toggle", "popover")
        .attr("data-trigger", "hover")
        .attr("data-placement","top")
        .attr("data-html", "true")
        .attr("data-content", function(d) { return d.value + " Tweets<br>Fecha: " + d.key; });

        this.svg.append("path")
        .data([entriesNeg])
        .attr("class", "line-neg")
        .attr("id", "lineNeg")
        .attr("d", valueline)
        .on("mouseover", function (){
          D3.selectAll(".line").style("stroke-opacity", 0.3);
          D3.selectAll(".dot").style("stroke-opacity", 0).style("fill", "none");
          })
        .on("mouseout", function (){
            D3.selectAll(".line").style("stroke-opacity", 1);
            D3.selectAll(".dot").style("stroke-opacity", 1).style("fill", "#e3f5dd");
        })
        .on("click", function(){
         // determine if current line is visible
         var active   = linePos.active ? false : true,
         newOpacity = active ? 0 : 1;
         // hide or show the elements
         D3.selectAll("#linePos").style("opacity", newOpacity);
         // update whether or not the elements are active
         linePos.active = active;
       });



      this.svg.selectAll("dot")
        .data(entriesNeg)
        .enter().append("circle")
        .attr("r", 3)
        .attr("class", "dot-neg")
        .attr("id", "lineNeg")
        .attr("cx", function(d) { return x(new Date(d.key)); })
        .attr("cy", function(d) { return y(d.value); })
        .attr("data-container", "body")
        .attr("data-toggle", "popover")
        .attr("data-trigger", "hover")
        .attr("data-placement","top")
        .attr("data-html", "true")
        .attr("data-content", function(d) { return d.value + " Tweets<br>Fecha: " + d.key; });

        //Traer al frente on hover:

        // D3.selectAll('path').on('mouseenter', function() {
        //   this.parentElement.appendChild(this);
        // });


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
