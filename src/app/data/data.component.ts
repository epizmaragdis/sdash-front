import { Component, OnInit } from '@angular/core';
import { DataService } from './data.service';
import { BubbleChartConfig } from '../bubble/bubble.config';
import { BarChartConfig } from '../bar/bar.config';
import { CounterConfig } from '../counter/count.config';
import { TrendChartConfig } from '../trend/trend.config';

@Component({
  selector: 'app-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.scss'],
  providers: [DataService]
})
export class DataComponent implements OnInit {

  private BubbleChartConfig: Array<BubbleChartConfig>;
  private BarChartConfig;
  private CounterConfig;
  private TrendChartConfig: TrendChartConfig;

  constructor(private dataService: DataService) {
    setInterval(() => { this.getTweets(); }, 1000 * 90 );
  }

  ngOnInit() {
    this.getTweets();
    this.getHistory();
  }

  getTweets() {
    this.dataService.getTweets()
      .subscribe((tweets: any) => {


        // Bubble Chart service
        //
        //

        let bubbleChartArea: BubbleChartConfig = {
          dataset: tweets.docs.map(data => {
            return { screen_name: data.screen_name, followers_count: data.followers_count, sentiment: data.sentiment.type, text: data.text, intent: data.intents[0].intent };
          })
        };

        this.BubbleChartConfig = new Array<BubbleChartConfig>();
        this.BubbleChartConfig.push(bubbleChartArea);



        // Bar Chart Service
        //
        //


        let barChartArea = {
          data: tweets.docs.reduce(function(intents, data) {
            if (data.intents[0].intent in intents) {
              if (data.sentiment.score > 0) {
                intents[data.intents[0].intent].pos++;
                } else {
                  intents[data.intents[0].intent].neg++
                }
            } else {
                if (data.sentiment.score > 0) {

                  intents[data.intents[0].intent]={
                  intent: data.intents[0].intent,
                  pos: 1,
                  neg: 0
                }
              } else {
                intents[data.intents[0].intent] = {
                intent: data.intents[0].intent,
                pos: 0,
                neg: 1,
              }
              }
            }
            return intents;
          }, {})
        };

        this.BarChartConfig = barChartArea.data;




        // Counter Service
        //
        //

        let counterArea: CounterConfig = {
          dataset: {
          all_tweets: tweets.docs.length,
          followers_count: tweets.docs.reduce(function(followers_count, data) {
            followers_count = followers_count +data.followers_count;
            return followers_count;
          }, 0), }
        }


        this.CounterConfig = counterArea.dataset;



      });
}
getHistory() {

    this.dataService.getHistory()
      .subscribe((history: any) => {

        // Trend Chart Service
        //
        //


        let trendChartArea: TrendChartConfig = {
          dataset: history.docs
            // .filter(data => {
            // return data.sentiment.score >0})
            .map(data =>{
            return { screen_name: data.screen_name, score: data.sentiment.score, created_at: new Date(data.created_at) }
          })
        };



        this.TrendChartConfig = trendChartArea;

      



      });
  }
}
