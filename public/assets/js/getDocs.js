function getDocs()
{
     var dept = document.getElementById('department').value;
    var output = document.getElementById('doctor');
    // Fetch Doctors of specific department
    fetch('/doctors/department?department='+dept).then( (doc) => {
        doc.json().then ( (arr) => {

                    var string= "<option value=''>Select</option>";
                    
                    for(i=0;i<arr.docNames.length;i++)
                    {
                        string=string+"<option value="+arr.doc_IDs[i]+">"+"[Doc: 0"+arr.docIDs[i]+"] "+arr.docNames[i]+"</option>";
                    }
                    string ='<select name="lol">'+string+'</select>';
                    output.innerHTML=string;
                    })
         });   
}

  