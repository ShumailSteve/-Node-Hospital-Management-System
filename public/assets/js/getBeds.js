function getBeds()
{
     var ward = document.getElementById('ward').value;
    var output = document.getElementById('bedID');
    // Fetch Doctors of specific department
    fetch('/hospital/ward/beds/?wardID='+ward).then( (doc) => {
        doc.json().then ( (arr) => {

                    var string= "<option value=''>Select</option>";
                    var len = arr.bedIDs.length; 
                    for(i=0; i<len; i++)
                    {
                        string=string+"<option value="+arr.bedIDs[i]+">"+"[Bed: "+arr.bedIDs[i]+"] "+"</option>";
                    }
                    string ='<select name="lol">'+string+'</select>';
                    output.innerHTML=string;
                    })
         });   
}

  