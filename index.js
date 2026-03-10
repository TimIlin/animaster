addListeners();

function addListeners() {
    const anim = animaster();
    let heartBeatingStopper;
    let moveAndHideStopper;
    let superStopper;
    document.getElementById('fadeInPlay')
        .addEventListener('click', function () {
            const block = document.getElementById('fadeInBlock');
            anim.fadeIn(block, 5000);
        });
    
    document.getElementById('fadeOutPlay')
        .addEventListener('click', function () {
            const block = document.getElementById('fadeOutBlock');
            anim.fadeOut(block, 5000);
        });

    document.getElementById('movePlay')
        .addEventListener('click', function () {
            const block = document.getElementById('moveBlock');
            anim.move(block, 1000, {x: 100, y: 10});
        });

    document.getElementById('scalePlay')
        .addEventListener('click', function () {
            const block = document.getElementById('scaleBlock');
            anim.scale(block, 1000, 1.25);
        });

    document.getElementById('moveAndHidePlay')
        .addEventListener('click', function () {
            const block = document.getElementById('moveAndHideBlock');
            moveAndHideStopper = anim.moveAndHide(block, 1000, {x:100, y:20});
        });
    document.getElementById('moveAndHideStop')
        .addEventListener('click', function () {
            moveAndHideStopper.stop()
            moveAndHideStopper = undefined;
        });
    
    document.getElementById('showAndHidePlay')
        .addEventListener('click', function () {
            const block = document.getElementById('showAndHideBlock');
            anim.showAndHide(block, 6000);
        });
    document.getElementById('heartBeatingPlay')
        .addEventListener('click', function () {
            const block = document.getElementById('heartBeatingBlock');
            heartBeatingStopper = anim.heartBeating(block);
        });
    document.getElementById('heartBeatingStop')
        .addEventListener('click', function () {
            const block = document.getElementById('heartBeatingBlock');
            heartBeatingStopper.stop();
            heartBeatingStopper = undefined;
        });
    document.getElementById('superPlay')
        .addEventListener('click', function () {
            const block = document.getElementById('superBlock');
            const customAnimation = animaster()
            .addMove(2000, {x: 40, y: 40})
            .addMove(1000, {x: 80, y: 0})
            .addFadeOut(100)
            .addMove(2000, {x: 40, y: -40})
            .addFadeIn(1000)
            .addMove(200, {x: 0, y: 0});

            superStopper = customAnimation.play(block);
        });
    document.getElementById('superStop')
        .addEventListener('click', function () {
            //const block = document.getElementById('superBlock');
            superStopper.stop();
            superStopper = undefined;
        });
}

function animaster(){
    const resetter = {
        resetFadeIn(element){
            element.style.transitionDuration = null;
            element.style.show = null;
            element.classList.add('hide');
        },
        resetFadeOut(element){
            element.style.transitionDuration = null;
            element.style.hide = null;
            element.classList.add('show');
        },
        resetMoveAndScale(element){
            element.style.transitionDuration = null;
            element.style.transform = null;
        }
    }
    const steps = [];
    return {
        /**
         * Блок плавно появляется из прозрачного.
         * @param element — HTMLElement, который надо анимировать
         * @param duration — Продолжительность анимации в миллисекундах
         */
        fadeIn(element, duration) {
            element.style.transitionDuration =  `${duration}ms`;
            element.classList.remove('hide');
            element.classList.add('show');
        },

        fadeOut(element, duration) {
            element.style.transitionDuration =  `${duration}ms`;
            element.classList.remove('show');
            element.classList.add('hide');
        },

        /**
         * Функция, передвигающая элемент
         * @param element — HTMLElement, который надо анимировать
         * @param duration — Продолжительность анимации в миллисекундах
         * @param translation — объект с полями x и y, обозначающими смещение блока
         */
        move(element, duration, translation) {
            //console.log(duration, translation)
            element.style.transitionDuration = `${duration}ms`;
            element.style.transform = getTransform(translation, null);
        },

        /**
         * Функция, увеличивающая/уменьшающая элемент
         * @param element — HTMLElement, который надо анимировать
         * @param duration — Продолжительность анимации в миллисекундах
         * @param ratio — во сколько раз увеличить/уменьшить. Чтобы уменьшить, нужно передать значение меньше 1
         */
        scale(element, duration, ratio) {
            element.style.transitionDuration =  `${duration}ms`;
            element.style.transform = getTransform(null, ratio);
        },

        moveAndHide(element, duration, translation){
            this.move(element, duration * 0.4, translation);
            setTimeout(() => this.fadeOut(element,duration * 0.6),duration *0.4)
            return{
                stop(){
                    //console.log("stopping")
                    resetter.resetMoveAndScale(element);
                    resetter.resetFadeOut(element);
                }
            }
        },

        showAndHide(element, duration) {
            const dur = duration / 3;
            this.fadeIn(element, dur);
            setTimeout(() => this.fadeOut(element, dur), dur)
        },

        heartBeating(element) {
            const timerId = setInterval(() => {
                this.scale(element, 0.5, 1.4);
                setTimeout(() => this.scale(element, 0.5, 1), 500);
            }, 1000);
            return {
                stop() {
                    clearInterval(timerId);
                }
            }
        },

        addMove(duration, transition) {
            ////console.log(this)
            steps.push({
                func: function(element) {
                    this.move(element, duration, transition)
                    ////console.log(duration)
                }.bind(this),
                duration: duration
            });
            return this;
        },

        addScale(duration, ratio) {
            steps.push({
                func: function(element) {
                    this.scale(element, duration, ratio)
                }.bind(this),
                duration: duration
            });
            return this;
        },

        addFadeIn(duration) {
            steps.push({
                func: function(element) {
                    this.fadeIn(element, duration)
                }.bind(this),
                duration: duration
            });
            return this;
        },

        addFadeOut(duration) {
            steps.push({
                func: function(element) {
                    this.fadeOut(element, duration)
                }.bind(this),
                duration: duration
            });
            return this;
        },

        addDelay(duration) {
            steps.push({
                func: function(element) {
                    
                }.bind(this),
                duration: duration
            });
            return this;
        },

        play(element, cycled=false) {
            //console.log(steps)
            const orig = element.cloneNode(true);
            //const origStyles = structuredClone(element.style);
            const wasHidden = element.style.hide === null;
            const timeoutIds = [];
            let duration = 0;
            let timerId;
            for (const step of steps) {
                //console.log(duration)
                timeoutIds.push(setTimeout(() => step.func(element), duration));
                duration += step.duration;
            }
            if (cycled) {
                timerId = setInterval(() => {
                    for (const step of steps) {
                        //console.log(duration)
                        timeoutIds.push(setTimeout(() => step.func(element), duration));
                    }
                }, duration)
            }
            return {
                stop() {
                    //element = orig;
                    //element.style = origStyles;
                    if (timerId) {
                        clearInterval(timerId)
                    }
                    for (const timeoutId of timeoutIds) {
                        clearTimeout(timeoutId);
                    }
                    resetter.resetMoveAndScale(element);
                    if (wasHidden) {
                        resetter.resetFadeIn(element);
                    }
                    else {
                        resetter.resetFadeOut(element);
                    }
                }
            }
        },
    }
}

function getTransform(translation, ratio) {
    const result = [];
    if (translation) {
        result.push(`translate(${translation.x}px,${translation.y}px)`);
    }
    if (ratio) {
        result.push(`scale(${ratio})`);
    }
    return result.join(' ');
}
