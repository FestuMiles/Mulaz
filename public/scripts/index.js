// Reference to slider
var slider = document.querySelector('.best-selling .container .slider');

// Reference to buttons
// var left = document.getElementById('prev');
// var right = document.getElementById('next');

// Button Events
// right.addEventListener('click', nextSlide);
function nextSlide(){
    slider.appendChild(slider.firstElementChild);
}

// left.addEventListener('click', prevSlide);
function prevSlide(){
    slider.prepend(slider.lastElementChild);
}

function autoSliding(){
    deleteInterval = setInterval(timer, 3000);
    function timer(){
        nextSlide();
    }
}
autoSliding();

// Hover to stop auto sliding 
// slider.addEventListener('mouseover',stopAutoSliding);
// left.addEventListener('mouseover',stopAutoSliding);
// right.addEventListener('mouseover',stopAutoSliding);


// function stopAutoSliding(){
//     clearInterval(deleteInterval);
// }

//Resume auto slide
// slider.addEventListener('mouseout',autoSliding);
// left.addEventListener('mouseout',autoSliding);
// right.addEventListener('mouseout',autoSliding);

