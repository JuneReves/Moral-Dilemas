/**
 * jspsych-html-button-response
 * Josh de Leeuw
 *
 * plugin for displaying a stimulus and getting a keyboard response
 *
 * documentation: docs.jspsych.org
 *
 **/

jsPsych.plugins["canvas"] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'canvas',
    description: '',
    parameters: {
      width: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Width',
        default: 800,
        description: 'The labels for the buttons.'
      },
      height: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Height',
        default: 500,
        description: 'The labels for the buttons.'
      },
      pen_color: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Pen color',
        default: 'red',
        description: 'The html of the button. Can create own style.'
      },
      pen_size: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Pen size',
        default: 10,
        description: 'The html of the button. Can create own style.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed under the button.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'How long to show the trial.'
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: true,
        description: 'If true, then trial will end when user responds.'
      },
    }
  }

  plugin.trial = function(display_element, trial) {

    display_element.innerHTML = '' +
        '<div style="z-index: 0; width="'+trial.width+'" height="'+trial.height+'; position:relative; top:20px; margin:auto;" style="position:relative; top:20px; margin:auto;">' +
        '<canvas id="can" width="'+trial.width+'" height="'+trial.height+'" style="position:relative; border:2px solid;"></canvas></div>' +
        '<br><button id="clear" class="jspsych-btn">Clear</button>';

    var canvas, ctx, flag = false,
        prevX = 0,
        currX = 0,
        prevY = 0,
        currY = 0,
        dot_flag = false;
    var penColor = trial.pen_color,
        penSize = trial.pen_size;

    canvas = display_element.querySelector('#can');
    ctx = canvas.getContext("2d");
    var w = canvas.width;
    var h = canvas.height;

    var img = new Image();
    img.src = '1.png';
    img.onload = function() {ctx.drawImage(img, 100, 150,200,200)};


    var img2 = new Image();
    img2.src = '2.png';
    img2.onload = function() {ctx.drawImage(img2, 500, 150,200,200)};



    canvas.addEventListener("mousemove", function (e) {
      findxy('move', e)
    }, false);
    canvas.addEventListener("mousedown", function (e) {
      findxy('down', e)
    }, false);
    canvas.addEventListener("mouseup", function (e) {
      findxy('up', e)
    }, false);
    canvas.addEventListener("mouseout", function (e) {
      findxy('out', e)
    }, false);

    function draw() {
      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(currX, currY);
      ctx.strokeStyle = penColor;
      ctx.lineWidth = trial.pen_size;
      ctx.stroke();
      ctx.closePath();
    }
    function findxy(res, e) {
      if (res == 'down') {
        prevX = currX;
        prevY = currY;
        currX = e.clientX - canvas.offsetLeft;
        currY = e.clientY - canvas.offsetTop;

        flag = true;
        dot_flag = true;
        if (dot_flag) {
          ctx.beginPath();
          ctx.fillStyle = penColor;
          ctx.fillRect(currX, currY, 2, 2);
          ctx.closePath();
          dot_flag = false;
        }
      }
      if (res == 'up' || res == "out") {
        flag = false;
      }
      if (res == 'move') {
        if (flag) {
          prevX = currX;
          prevY = currY;
          currX = e.clientX - canvas.offsetLeft;
          currY = e.clientY - canvas.offsetTop;
          draw();
        }
      }
    }



    function erase() {
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, 100, 150,200,200);
      ctx.drawImage(img2, 500, 150,200,200);
    }

    display_element.querySelector('#clear').addEventListener('click', erase);

    // start time
    var start_time = performance.now();

    // store response
    var response = {
      rt: null,
      button: null
    };

    // function to handle responses by the subject
    function after_response(choice) {

      // measure rt
      var end_time = performance.now();
      var rt = end_time - start_time;
      response.button = choice;
      response.rt = rt;

    };

    // function to end trial when it is time
    function end_trial() {

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // gather the data to store for the trial
      var trial_data = {
        "rt": response.rt,
        "stimulus": trial.stimulus,
        "button_pressed": response.button
      };

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };


  };

  return plugin;
})();
