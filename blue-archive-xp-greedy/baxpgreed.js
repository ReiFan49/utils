window.addEventListener('load', function(){
  var xpRates = [1, 10, 40, 200];

  Object.prototype.tapInside = function(callback){
    callback.call(this, this);
  };
  Number.prototype.toGroupedDigit = function(){
    return this.toLocaleString('en-US');
  };
  Array.prototype.sum = function(callback){
    return this.reduce(function(total, item, index){
      if(typeof callback === 'function')
        return total + callback.call(this, item, index);
      return total + item;
    }, 0);
  };

  function getInputValues(elmGroup){
    function converterCallback(input){return input.validity.valid ? input.valueAsNumber : 0;}

    if(Array.isArray(elmGroup)) {
      return [].map.call(elmGroup, converterCallback);
    } else {
      return [].map.call(elmGroup.querySelectorAll('input'), converterCallback);
    }
  }
  function totalRawValue(group){
    return group.sum(function(value, index){
      return value * xpRates[index];
    });
  }
  function totalValue(inputGroup){
    return totalRawValue([].map.call(inputGroup, function(input){
      return input.validity.valid ? input.valueAsNumber : 0;
    }));
  }

  ['xp-greed-upper', 'xp-target'].forEach(function(elmKeyName){
    var elmKey = document.getElementById(elmKeyName);
    [].slice.call(elmKey.children, 1, 5).forEach(function(elmBox){
      elmBox.innerHTML = '';
      var input   = document.createElement('input');
      input.type  = 'number';
      input.min   = 0;
      input.step  = 1;
      input.max   = 90000;
      input.value = 0;
      input.classList.add('xp-input');
      elmBox.appendChild(input);
    });
  });

  function updateAdjustedGreed(){
    var maxItems, expItems, maxValue, expValue, useItems;
    maxItems = getInputValues(document.getElementById('xp-target'));
    expItems = getInputValues(document.getElementById('xp-greed-upper'));
    maxValue = totalRawValue(maxItems);
    expValue = totalRawValue(expItems);
    useItems = JSON.parse(JSON.stringify(expItems));

    for(var i = 3; i > 0; i--) {
      for(var j = 0; j < i; j++) {
        var rate = (xpRates[i] / xpRates[j]) | 0;
        var maxDelta = maxItems[j] - useItems[j];
        var adjustDelta = Math.min((maxDelta / rate) | 0, useItems[i]);
        if (adjustDelta <= 0) continue;

        useItems[i] -= adjustDelta;
        useItems[j] += (adjustDelta * rate) | 0;
      }
    }

    [].slice.call(document.getElementById('xp-greed-lower').querySelectorAll('div'), 1).forEach(function(outputElm, outputIndex){
      switch(outputIndex) {
      case 0:
      case 1:
      case 2:
      case 3:
        outputElm.innerText = useItems[outputIndex].toGroupedDigit();
        break;
      case 4:
        outputElm.innerText = expValue.toGroupedDigit();
        break;
      }
    });
  }

  document.querySelectorAll('input.xp-input').forEach(function(inputElm, inputIndex, inputList){
    inputElm.addEventListener('paste', function(e){
      var clip = e.clipboardData;
      clipContent = clip.getData('Text');
      if (!clipContent) return;

      e.preventDefault();

      var expr = /\w+/g;
      var exprOutput;
      var indexOffset = 0;
      while(exprOutput = expr.exec(clipContent)) {
        var value = parseInt(exprOutput[0], 10) | 0 || 0;
        var cElm = inputList[inputIndex + indexOffset]
        var oldValue = cElm.value;
        cElm.value = value;
        if(!cElm.validity.valid) cElm.value = oldValue;
        
        indexOffset += 1;
        if(inputIndex + indexOffset >= inputList.length) break;
      }

      updateAdjustedGreed();
    });
    var previousValue;
    inputElm.addEventListener('change', function(e){
      if(!e.target.validity.valid) {
        e.target.value = (typeof previousValue === 'string' && previousValue.length) ? previousValue : (e.target.defaultValue | 0);
      } else {
        e.target.value = e.target.valueAsNumber;
        previousValue = e.target.value;
      }
      updateAdjustedGreed();
    });
  });
  updateAdjustedGreed();
});