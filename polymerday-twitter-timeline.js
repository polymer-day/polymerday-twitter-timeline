(function() {
  Polymer({
    is: 'polymerday-twitter-timeline',

    properties: {

      /**
       * This id has to be created through twitter account
       */
      widgetId: String,

      /**
       * Set an assertive ARIA politeness value for widget components and updates.
       * *polite*, *assertive* or *rude*
       * Default *polite*
       */
      ariaPolite: String,

      /**
       * When set to dark, displays Tweet with light text over a dark background.
       */
      theme: String,

      /**
       * Adjust the color of Tweet links with a hexadecimal color value.
       */
      linkColor: String,

      /**
       * Set the height of a displayed widget, overriding the value stored with the widget ID. Must be greater than 200 pixels.
       * Note: the height parameter does not apply when a tweet-limit parameter is specified
       * Default: *600*
       */
      height: Number,

      /**
       * Set the maximum width of the widget between 180 and 520 pixels.
       */
      width: Number,

      /**
       * Set the color of widget component borders, including the border between Tweets, with a hexadecimal color value.
       */
      borderColor: String,

      /**
       *
       * Remove a display component of a timeline with space-separated tokens:
       *  *noheader* - hides the header
       *  *nofooter* - hides the footer, if visible
       *  *noborders* - removes all borders: around the widget, between Tweets, and inside a Tweet
       *  *noscrollbar* - crop and hide the timeline scrollbar, if visible
       *  *transparent* - remove background color
       */
      chrome: String,

      /**
       * Display an expanded timeline of between 1 and 20 Tweets.
       */
      tweetLimit: Number,

      /**
       * A supported Twitter language code.
       */
      lang: {
        type: String,
        value: 'en'
      },

      /**
       * Number of tweets
       */
      tweetCount: {
        type: String
      },

      /**
       * Boolean to set if component is or not visible
       */
      _hide: {
        type: Boolean,
        value: true
      }
    },

    ready: function() {
      if (typeof this.widgetId === 'undefined') {
        this._log(this._logf('widgetId', 'widgetId must not be undefined'));
        return;
      }

      twttr.ready(function() {
        this._createWidget();
        //Event rendered for observe tweets and count it
        twttr.events.bind('rendered', function (event) {
          this.set('_hide', false);
          var tweetCountObserver = new MutationObserver(_tweetCountObserverHandler);
          this.set('tweetCount', event.target.contentDocument.querySelectorAll('.timeline-TweetList-tweet').length);
          tweetCountObserver.observe(event.target.contentDocument.querySelector('.timeline-TweetList'), { childList: true });
          var ctx = this;
          function _tweetCountObserverHandler (mutations, observer) {
            ctx.tweetCount += mutations[0].addedNodes.length;
          };
        }.bind(this));
      }.bind(this));

      /** Begin **/
      /** Code to manage the custom CSS inside the iframe of twitter widget **
       ** You can fill the css variable with css properties **/
      var observer,
        css = `
          .timeline-Tweet {
            position: relative;
          }
          .timeline-Tweet:hover {
            background-color: inherit !important;
          }
          .Avatar {
            border-radius: 50%;
          }
          .TweetAuthor-avatar {
            width: 48px !important;
            height: 48px !important;
          }
          .TweetAuthor-name {
            font-size: 16px !important;
          }
          .timeline-Tweet-text {
            color: #616161;
            font-size: 16px !important;
            line-height: 24px !important;
            margin-left: 56px !important;
          }
          .timeline-Tweet-author {
            color: #616161;
            padding-left: 56px !important;
          }
          .timeline-Tweet-media {
            display: none;
          }
          .timeline-TweetList-tweet:nth-child(odd) {
            background-color: #f7fafd;
          }
          .timeline-TweetList-tweet:nth-child(even) {
            background-color: #ffffff;
          }
          .timeline-Tweet-actions {
            display: none;
          }
          .timeline-Tweet-brand {
            display: none;
          }
          .TweetAuthor-screenName {
            display: none;
          }
          .timeline-Tweet-metadata {
            position: absolute;
            top: 8px;
            left:100%;
            transform: translateX(-150%);
          }
          .timeline-Tweet-timestamp {
            color: #616161 !important;
          }
          .timeline-Tweet:hover .timeline-Tweet-timestamp {
            color: #616161 !important;
          }`;

      if (css !== '') {
        observer = new MutationObserver(domMutationHandler);
        observer.observe(this.$.timeline, { childList: true });
      }

      // CSS Style observer & handler
      function domMutationHandler(mutations, observer) {

        var style;

        style = document.createElement('style');
        style.type = 'text/css';
        if (style.styleSheet) {
          style.styleSheet.cssText = css;
        }
        else {
          style.appendChild(document.createTextNode(css));
        }

        //FIX firefox. setTimeout needed due to the styles were not loaded
        setTimeout(function() {
          mutations[0].addedNodes[0].contentDocument.head.appendChild(style);
        }, 0);

        observer.disconnect();
      }
      //** End **/
    },

    /**
     * Create a twitter widget with a specific id
     */
    _createWidget: function() {
      twttr.widgets.createTimeline({
        sourceType: 'widget',
        widgetId: this.widgetId
      },
      this.$.timeline, {
        ariaPolite: this.ariaPolite,
        lang: this.lang,
        theme: this.theme,
        linkColor: this.linkColor,
        borderColor: this.borderColor,
        height: this.height,
        width: this.width,
        chrome: this.chrome,
        tweetLimit: this.tweetLimit
      });
    }
  });
}());
