$(document).ready(function () {
    loadFoodItems();
});

// CLick functionality to the grid-items with snacks in the vending machine
$('.food-grid-container').on('click', 'div', function() {
    var item_id = $("#number").text($(this).data('id'));
    console.log($(this).data('id'));
});

// GETS all the food items for the grid
function loadFoodItems() {
    var contentBoxes = $('.food-grid-container');
    $.ajax({
        type: 'GET',
        url: 'http://tsg-vending.herokuapp.com/items',
        success: function(itemArray) {
            $.each(itemArray, function (index, item){
                var itemId = item.id;
                var itemName = item.name;
                var itemPrice = item.price;
                var itemQuantity = item.quantity;

                var row = `<div class="grid-item" onclick="grabItemInfo(${itemId})" data-id=${itemId}>`;
                row += '<p class="id-number">' + itemId + '</p>';
                row += '<h5 class="food-item">' + itemName + '</h4>';
                row += '<h5> $' + itemPrice + '</h4>';
                row += '<h5> Quantities Left: ' + itemQuantity + '</h4>';
                row += '</div>';
                contentBoxes.append(row);

            })
        },
        error: function() {
            $('#message').text('Error');
                console.log("error");
        }
    });
}

var item_array = [];
function grabItemInfo(item_id){
    item_array = [item_id];
}

// Formats the money to stay in 2 decimal points
const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
})

// Global vriable for money
var money = 0;
// click functionilty for buttons to push in money
$('#dollar').click(()=>{
    money += 1.00;
    $("#money-total").text(formatter.format(money));
});
$('#quarter').click(()=>{
    money += 0.25;
    $("#money-total").text(formatter.format(money));
});
$('#dime').click(()=>{
    money += 0.10;
    $("#money-total").text(formatter.format(money));
});
$('#nickel').click(()=>{
    money += 0.05;
    $("#money-total").text(formatter.format(money));
});

$('#make-purchase-button').click(()=>{
    makePurchase(item_array[0], money);
    $('#money-total').text("$0.00");
    money = 0;
});

function makePurchase(itemId, money){
    var money_fixed = money.toFixed(2);
    $('.food-grid-container').empty();
    if(isNaN(itemId)){
        $('#message').text("You must select an Item!");
    }
    else{
        $.ajax({
            type: 'POST',
            url: `http://tsg-vending.herokuapp.com/money/${money}/item/${itemId}`,
            success: function(money) {
                var quarters = money.quarters;
                var dimes = money.dimes;
                var nickels = money.nickels;
                var pennies = money.pennies;
                outputChange(quarters, dimes, nickels, pennies);
                money = 0;
                $('#money-total').text("$0.00");
                $('#message').text("Thank you!");
                $('#number').text('')
            },
            error: function(error){
                $('#message').text(error.responseJSON.message);
            }
        });
    }
    loadFoodItems();
}

function outputChange(quarters, dimes, nickels, pennies){
    var message ="";
    if(quarters == 1)
        message += quarters + ' Quarter, ';
    else if(quarters > 1)
        message += quarters + ' Quarters, ';

    if(dimes == 1)
        message += dimes + ' Dime, ';
    else if(dimes > 1)
        message += dimes + ' Dimes, ';

    if(nickels == 1)
        message += nickels + ' Nickel, ';
    else if(nickel > 1)
        message += nickels + ' Nickels, ';

    if(pennies == 1)
        message += pennies + ' Penny, ';
    else if(pennies> 1)
        message += pennies + ' Pennies, ';

    $('#return-change').text(message);
}

$('#change-return').click(()=>{
    returnChange();
});

function returnChange(){
    var amount = money.toFixed(2);
    if(amount == 0.00){
        $('#message').text("You do not have change");
    }else{
        $('#money-total').text("$0.00");
        change_dictionary = cancelOrder(amount);
        outputChange(change_dictionary.Quarters, change_dictionary.Dimes, change_dictionary.Nickels, change_dictionary.Pennies)
        money = 0;
    }
}

function cancelOrder(amount){
    var change_dictionary = {}
    const coins = [0.25, 0.10, 0.05, 0.01];
    let count = new Array(coins.length).fill(0);
    let i = 0;
    while(amount > 0){
        while(amount >= coins[i]){
            amount = (amount - coins[i]).toFixed(2);
            count[i] += 1;
        }
        i+=1;
    }
    change_dictionary['Quarters'] = count[0];
    change_dictionary['Dimes'] = count[1];
    change_dictionary['Nickels'] = count[2];
    change_dictionary['Pennies'] = count[3];
    console.log(change_dictionary.Quarters, change_dictionary.Dimes, change_dictionary.Nickels, change_dictionary.Pennies);

    return change_dictionary;
}
