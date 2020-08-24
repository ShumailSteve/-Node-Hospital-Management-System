inames = []
idesc = []
iqty = []
iprice = []

function addItem() {
        inames.push(document.getElementById('itemName').value);
        idesc.push(document.getElementById('description').value);
       iqty.push(document.getElementById('qty').value);
       iprice.push(document.getElementById('unitPrice').value)
       displayCart();
}

function displayCart() {
    cartdata = '<table class="center"> <tr><th>#</th><th>Item Name</th> <th>Description  </th> <th> Price </th> <th> Qty </th> <th> Total </th> </tr>';
 
    total = 0;
    
    for(i=0; i<inames.length; i++) {
        total += iqty[i] * iprice[i];
        cartdata += '<tr> <td>'+ parseInt(i+1) + '</td> <td> <input class="form-control" type="text" style="min-width:150px" readonly=""  value='+inames[i]+' ></td>'+
                              '<td> <input class="form-control" type="text" style="min-width:150px" readonly="" value='+idesc[i]+'></td> ' +
                                '<td> <input class="form-control" style="width:100px" type="number" id="unitPrice"  value='+iprice[i]+'> </td>' + 
                                '<td> <input onkeyup="calTotal()" class="form-control" style="width:80px" type="number" id="qty"  value='+iqty[i]+'> </td>' + 
                                '<td> <input class="form-control form-amt" readonly="" style="width:120px" readonly="" type="text" id="total" value='+iprice[i] * iqty[i]+'> </td>' +
                                // '<td> <button onclick="addItem()">Add</button> </td>'+
                                '<td> <button onclick="delElement('+ i + ')"  class="btn btn-danger" btn-sm>Delete</button> </td>'+
                    '</tr>'    
                 

     
    }
    cartdata += '<tr><td></td><td></td><td></td><td></td><td></td><td>' + total + '</td></table>' 
        document.getElementById('cart').innerHTML = cartdata
}


function calTotal() {
            var tot = 0;
            var qty = (document.getElementById('qty').value);
            var unitPrice = (document.getElementById('unitPrice').value);
            tot = parseInt(qty) * parseInt(unitPrice);
            document.getElementById('total').value = tot;
}
function delElement(a) {
        inames.splice(a,1);
        iprice.splice(a,1);
        iqty.splice(a,1);
        displayCart();
}
// document.addEventListener("DOMContentLoaded", function(event) {
//     addItem();
//  });