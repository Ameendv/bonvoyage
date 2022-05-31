var stateObject = {
  1: { 1: [], 2: [] },
  2: { 2: [], 3: [], 4: [] },
  3: { 3: [], 4: [], 5: [], 6: [] },
  4: { 4: [], 5: [], 6: [], 7: [], 8: [] },
};
window.onload = function () {
  var state = document.getElementById("state"),
    guests = document.getElementById("guests"),
    districtSel = document.getElementById("districtSel");
  for (var rooms in stateObject) {
    state.options[state.options.length] = new Option(rooms, rooms);
  }
  state.onchange = function () {
    guests.length = 1; // remove all options bar first
    districtSel.length = 1; // remove all options bar first
    if (this.selectedIndex < 1) return; // done
    for (var state in stateObject[this.value]) {
      guests.options[guests.options.length] = new Option(state, state);
    }
  };
  state.onchange(); // reset in case page is reloaded
  guests.onchange = function () {
    districtSel.length = 1; // remove all options bar first
    if (this.selectedIndex < 1) return; // done
    var district = stateObject[state.value][this.value];
    for (var i = 0; i < district.length; i++) {
      districtSel.options[districtSel.options.length] = new Option(
        district[i],
        district[i]
      );
    }
  };
};
