window.addEventListener('load', function(){
  var noteRate = {tap: 500, hold: 1000, slide: 1500, break: 2500, touch: 500};
  var noteExRate = Object.assign(
    {}, noteRate, {break: 2600}
  );
  var noteCount = {};
  var outputList = [];
  Object.prototype.tapInside = function(callback){
    callback.call(this, this);
  };
  function totalScore(){
    return Object.entries(noteCount).reduce(function(score, noteData){
      var noteType = noteData[0];
      var noteAmount = noteData[1];
      if(!(noteType in noteRate)) return score;
      return score + noteRate[noteType] * noteAmount;
    }, 0);
  }
  function totalScoreMAX(){
    return Object.entries(noteCount).reduce(function(score, noteData){
      var noteType = noteData[0];
      var noteAmount = noteData[1];
      if(!(noteType in noteExRate)) return score;
      return score + noteExRate[noteType] * noteAmount;
    }, 0);
  }
  function breakTapRate(){
    return (totalScoreMAX() / totalScore()) - 1;
  }
  function breakDeluxeBonusRate(){
    var rate = 0.2 / (100 * breakTapRate());
    return isFinite(rate) ? rate : 0.0;
  }
  function totalScoreDeluxeMAX(){
    return Object.entries(noteCount).reduce(function(score, noteData){
      var noteType = noteData[0];
      var noteAmount = noteData[1];
      var rate = 0.0;
      if(noteType === 'break') {
        rate = 500 * (5 + breakDeluxeBonusRate());
      } else {
        if(!(noteType in noteRate)) return score;
        rate = noteRate[noteType];
      }
      return score + rate * noteAmount;
    }, 0);
  }
  function updateOutput(){
    outputList.forEach(function(f){f();});
  }
  document.querySelectorAll('tr[data-entry]').forEach(function(entryElm){
    var entryType = entryElm.dataset.entry;
    var inputElm = entryElm.children[1].children[0];
    if(!inputElm.checkValidity()){
      inputElm.value = inputElm.attributes.value.value;
    }
    var oldValue = inputElm.value;
    Object.defineProperty(noteCount, entryType, {
      get: function(){ return inputElm.valueAsNumber; },
      enumerable: true,
    });
    inputElm.addEventListener('input', function(e){
      if(!e.target.value) { e.target.value = 0; }
      if(!e.target.validity.valid) {
        e.target.value = oldValue;
        return;
      }
      if(e.target.value[0] === '0' && e.target.value.length > 1) {
        e.target.value = e.target.valueAsNumber;
      }
      oldValue = inputElm.value;
      updateOutput();
    });
    outputList.push(function(){
      var scoreElm = entryElm.children[2];
      var scoreNote = noteRate[entryType] * inputElm.valueAsNumber;
      scoreElm.innerText = scoreNote.toFixed(0);
    });
    outputList.push(function(){
      var rateElm = entryElm.children[3];
      var scoreNote = noteRate[entryType] * inputElm.valueAsNumber;
      var rateNote = scoreNote / totalScore();
      rateElm.innerText = (rateNote * 100).toFixed(6) + "%";
    });
  });
  document.querySelectorAll('tr[data-result]').forEach(function(outputElm){
    var outType = outputElm.dataset.result;
    var outElm = outputElm.children[1];
    switch(outType){
    case 'tap-percent':
    outputList.push(function(){
      var oneRate = 500 / totalScore();
      outElm.innerText = (oneRate * 100).toFixed(6) + "%";
    });
    break;
    case 'score-standard-sss':
    outputList.push(function(){
      outElm.innerText = totalScore().toFixed(0);
    });
    break;
    case 'score-standard-max':
    outputList.push(function(){
      outElm.innerText = totalScoreMAX().toFixed(0);
    });
    break;
    case 'break-rate':
    outputList.push(function(){
      outElm.innerText = (100 * breakTapRate()).toFixed(6) + "%";
    });
    break;
    case 'break-bonus-deluxe':
    outputList.push(function(){
      outElm.innerText = (5 + breakDeluxeBonusRate()).toFixed(3) + "x";
    });
    break;
    case 'score-deluxe-max':
    outputList.push(function(){
      outElm.innerText = totalScoreDeluxeMAX().toFixed(0);
    });
    break;
    }
  });
  updateOutput();
});