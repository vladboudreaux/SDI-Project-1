# SDI-Project-1 Pokemon Battler

### Overview
The Pokemon Battler is an application that will fetch 2 Pokemon from the Poke API and force them into a fight! Each Pokemon will have 4 moves available to them, randomly selected from the API. Moves that do damage will detract from the Pokemon's HP. Players will continue until one Pokemon's HP is set to 0. The survivor is the winner!

##
### How to Play
Players control the Pokemon that spawns on the left side of the screen. The "computer" controls the card on the right. The player is unable to select moves that Pokemon has, but they can hover over the move to see a description. A very rudimentary algorithm is in place to ensure that damage is not the same every time, but this could be much more fleshed out and take into account all of the Pokemon's stats.

##
### Current Status
The application currently pulls in 2 Pokemon with their base stats and 4 randomly selected moves. LocalStorage has been implemented so that the user can freely leave the page and come back to finish their battle.


##
### Next Steps
[x] We got some base battle logic in! That was fun.<br>
[x] Create a built in How to Play manual on another page. <br>
[] Show Pokedex entries either on the card or while hovering over the cards image.<br>
[x] Maybe figure out how to do some animations.


##
### Some additional resources I might use
https://codepen.io/simeydotme/pen/QWdBOwx - for pokeball animations. this was a pain

https://www.w3schools.com/howto/howto_css_shake_image.asp - for shaking the card. this was a pain
