(function() {
    var context = this;

    /*
        Parameters in config [default]
        fps = integer, default 60
        fpsMode = string, ['fixed'] 'screenHz'
        autoStart = boolean, [false]
        createDebugKeyBoardShortcuts = boolean, [false]
    */
    class GameLoop {
        constructor(config) {
            if (config === null) {
                config = {}
            }
            if (typeof config === 'function') {
                this.callback = config;
            } else {
                this.callback = config.callback || function() {};
            }
            if (config.fps && config.fpsMode && config.fpsMode === 'screenHz')
                console.warn('GameLoop config: Don\'t set FPS when setting fpsMode screenHz, it\'s irrelevant and framerate will still be locked to screen framerate.')
            
            this.fps = config.fps || 60;
            this.fpsMode = config.fpsMode || 'fixed';
            this.playing = config.autoStart !== false;
            this.createDebugKeyBoardShortcuts = config.createDebugKeyBoardShortcuts || false;
            this.interval = null;
            this.previousFrame = null;

            if (this.createDebugKeyBoardShortcuts)
                this.createShortcuts();
            
            if (this.playing) {
                this.start();
            }
        }
        createShortcuts() {
            context.addEventListener("keydown", function(e) {
                switch(e.keyCode) {
                    case 80:
                        this.toggle();
                    break;
                }
            }.bind(this))
        }
        determineDiff() {
            var prev = this.previousFrame;
            this.previousFrame = Date.now();
            if (prev) {
                return Math.min(Date.now() - prev, 16.666666);
            } else {
                return 16; //First frame is free
            }
        }
        start() {
            this.playing = true;

            function wrappedLoop() {
                if (this.fpsMode === 'screenHz') {
                    context.requestAnimationFrame(wrappedLoop.bind(this));
                }
                if (this.playing) {
                    this.callback(this.determineDiff());
                }
            }
            switch(this.fpsMode) {
                case 'fixed':
                    this.interval = context.setInterval(wrappedLoop.bind(this), 1000/this.fps);
                break;
                case 'screenHz':
                    context.requestAnimationFrame(wrappedLoop.bind(this));
                break;
            }
        }
        toggle() {
            this.playing = !this.playing;
            this.resetTime();
        }
        pause() {
            this.playing = false;
        }
        play() {
            this.playing = true;
            this.resetTime();
        }
        stop() {
            clearInterval(this.interval);   
        }
        resetTime() {
            this.previousFrame = Date.now();
        }
    };

    if (typeof define !== 'undefined') {
        define('GameLoop', [], function() {
          return GameLoop;
        });
    } else if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
          exports = module.exports = GameLoop;
        }
    exports.GameLoop = GameLoop;
    } else {
        this.GameLoop = GameLoop;
    }
}.bind(this))();