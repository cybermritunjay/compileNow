
var Execute_code = function(compiler_name,file_name,code,output_command,languageName,extra_arguments,input)
{

        this.compiler_name=compiler_name;
        this.file_name=file_name;
        this.code = code;
        this.output_command=output_command;
        this.langName=languageName;
        this.extra_arguments=extra_arguments;
        this.input=input;

        this.folder= 'active/' + Math.random(10); //folder in which the temporary folder will be saved
        this.path=__dirname+"/"; //current working path
        this.vm_name='robodia'; //name of virtual machine that we want to execute
        this.timeout_value=20;//Timeout Value, In Seconds;
}



Execute_code.prototype.run = function(success) 
{
    var Execute = this;
    //console.log("run");
    this.prepare( function(){
        Execute.execute(success);
    });
}


Execute_code.prototype.prepare = function(success)
{
    //console.log("prepare");
    var exec = require('child_process').exec;
    var fs = require('fs');
    var Execute = this;
    //console.log(this.input);
    var inputs = this.input;
    inputs = JSON.parse(inputs);
    inputLength = inputs.length;
    //console.log(inputLength);

    exec("mkdir "+ this.path+this.folder + " && cp "+this.path+"/Payload/* "+this.path+this.folder+"&& chmod 777 "+ this.path+this.folder,function(st)
        {
            fs.writeFile(Execute.path + Execute.folder+"/" + Execute.file_name, Execute.code,function(err) 
            {
                if (err) 
                {
                    //console.log(err);
                }    
                else
                {
                   //console.log(Execute.langName+" file was saved!");
                    exec("chmod 777 \'"+Execute.path+Execute.folder+"/"+Execute.file_name+"\'");
                   /* var i = "";
                    var dat;
                    var result;
                    inputs.forEach(function(elem){
                        //console.log(elem);

                        
                        
                        elem = elem.trim();
                        i =inputs.indexOf(elem);
                        //console.log("first"+i);
                    fs.writeFile(Execute.path + Execute.folder+"/inputFile"+i,elem,'utf-8',function(err){
                        if (err) {
                            console.log(err);
                        }
                    })
                       //exec("echo -n "+elem+" >> "+Execute.path + Execute.folder+"/inputFile"+i);
                                console.log("Input"+i+" file was saved!");
                                exec("chmod 777 \'"+Execute.path+Execute.folder+"/inputFile"+i+"\'")
                                //console.log(typeof inputLength);
                               // console.log("second"+i);  

                       
                             
});
                    
                    dat = fs.readFileSync(Execute.path + Execute.folder+"/inputFile"+i,'utf8');

                        result = dat.replace(new RegExp("\\n","g"),"...");

                          fs.writeFileSync(Execute.path + Execute.folder+"/inputFile"+i, result) 
                    success(); 

                    console.log(sandbox.langName+" file was saved!");
                    exec("chmod 777 \'"+sandbox.path+sandbox.folder+"/"+sandbox.file_name+"\'") */

                    //elem = elem.trim();
                    for (var i = inputs.length - 1; i >= 0; i--) {
                        //exec("touch "+Execute.path + Execute.folder+"/inputFile"+i);

                        fs.writeFileSync(Execute.path + Execute.folder+"/inputFile"+i,String(inputs[i]));
                            //console.log("Input file was saved!"+i);
                            fs.chmodSync(Execute.path+Execute.folder+"/inputFile"+i, "777");
                           // exec("chmod --reference=\'"+Execute.path+Execute.folder+"/"+Execute.file_name+"\' " +Execute.path + Execute.folder+"/inputFile"+i);
                            //console.log("chmod --reference=\'"+Execute.path+Execute.folder+"/"+Execute.file_name+"\' " +Execute.path + Execute.folder+"/inputFile"+i);
                    }
                            
                            success();
                      

                    
                } 
            });



            
        });

}

Execute_code.prototype.execute = function(success)
{
    //console.log("execute");
    var exec = require('child_process').exec;
    var fs = require('fs');
    var myC = 0; //variable to enforce the timeout_value
    var Execute = this;

    //this statement is what is executed
    var st = "sh "+this.path+'Docker.sh ' + this.timeout_value + 's -u mysql -e \'NODE_PATH=/usr/local/lib/node_modules\' -i -t -v  "' + this.path + this.folder + '":/user ' + this.vm_name + ' /user/script.sh ' + this.compiler_name + ' ' + this.file_name + ' ' + this.output_command+ ' ' + this.extra_arguments;
    
    //log the statement in console
    console.log(st);

    //execute the Docker, This is done ASYNCHRONOUSLY
    exec(st);
    //console.log("------------------------------")
    //Check For File named "completed" after every 1 second
    var intid = setInterval(function() 
        {
            //Displaying the checking message after 1 second interval, testing purposes only
            //console.log("Checking " + Execute.path+Execute.folder + ": for completion: " + myC);

            myC = myC + 1;
            
            fs.readFile(Execute.path + Execute.folder + '/completed', 'utf8', function(err, data) {
            
            //if file is not available yet and the file interval is not yet up carry on
            if (err && myC < Execute.timeout_value) 
            {
                //console.log(err);
                return;
            } 
            //if file is found simply display a message and proceed
            else if (myC < Execute.timeout_value) 
            {
                //console.log("DONE");
                //check for possible errors
                fs.readFile(Execute.path + Execute.folder + '/errors', 'utf8', function(err2, data2) 
                {
                    if(!data2) data2=""
                    //console.log("Error file: ")
                    //console.log("err: "+data2);

                    //console.log("Main File");
                    //console.log("main: "+data);

                    var lines = data.toString().split('*-COMPILEBOX::ENDOFOUTPUT-*')
                    data=lines[0];
                    var time=lines[1];

                    //console.log("Time: ");
                    //console.log(time);
                    

                    success(data,time,data2);
                });

                //return the data to the calling functoin
                
            } 
            //if time is up. Save an error message to the data variable
            else 
            {
                //Since the time is up, we take the partial output and return it.
                fs.readFile(Execute.path + Execute.folder + '/logfile.txt', 'utf8', function(err, data){
                    if (!data) data = "";
                    data += "\nExecution Timed Out";
                    //console.log("Timed Out: "+Execute.folder+" "+Execute.langName)
                    fs.readFile(Execute.path + Execute.folder + '/errors', 'utf8', function(err2, data2) 
                    {
                        //console.log(data2);
                        if(!data2) data2="";
                         var lines = data.toString().split('*---*')
                        data=lines[0]
                        var time=lines[1]
                        data2=data2.toString();
                        //console.log(data2);
                        //console.log("Time: ")
                        //console.log(time)

                        success(data,data2)
                    });
                });
                
            };


            //now remove the temporary directory
            //console.log("ATTEMPTING TO REMOVE: " + Execute.folder);
            //console.log("------------------------------")
            //exec("rm -r " + Execute.folder);

            
            clearInterval(intid);
        });
    }, 1000);

}


module.exports = Execute_code;
