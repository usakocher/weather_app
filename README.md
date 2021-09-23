# weather_app

## Requirements
We were asked to create a website, using API calls, that took in user inputs and returned information about the weather.

## Program Design
This program will take in a zip or postal code, and a country selection, and return the current weather in that location, along with a 5 Day Forecast.
If a user wants the local weather, they can just hit the button and it'll pull the location from the device. The app will also provide a pop up alert 
if the region searched has any weather advisories.

## Assumptions
The assumption made for this app was that anyone getting local data from a device's location would be located in the US.

## Program
This program uses five APIs.<br>
The program takes user inputs and gets a location. If they input a zip/postal code and a country, it goes to an API and returns the coordinates. It uses one API
for postal codes, and a separate one for everything else.<br>
If the user leaves those fields blank, the program makes a protected call to an API to return the user's location. It then uses those coordinates to obtain
the city name from another API.<br>
Finally, when the correct coordinates are obtained, it sends those out the weather API to return the weather data.<br>
The program then displays the city name, and the weather information to the user. It will also show a pop up if there are any weather alerts for the target area.

## Known Issues
There is no server-side validation in this program. Therefore, the program will fail when trying to obtain the coordinates. The app will continue and can still be
used by using the clear button or by submitting new information.

## Lessons Learned
What started as pretty simple instructions turned into a gigantic project. When addressing this I was trying to make it as real as possible. In doing so, I created a bunch
of problems for myself, the developer, to solve. Like when adding the city name from coordinates derived from a device, I need to use another API to obtain it.
I understand now how much work can go into these "little" projects and appreciate how much non developers don't appreciate the amount of work it takes.
