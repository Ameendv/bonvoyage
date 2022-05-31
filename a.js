var dateData, dateObject, dateReadable;

dateData = date; //For example

dateObject = new Date(Date.parse(dateData));

dateReadable = dateObject.toDateString();
