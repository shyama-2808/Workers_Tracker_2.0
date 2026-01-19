const express = require('express');
const cors = require('cors');
const db=require('./db');

const app=express();
app.use(cors());//enable cors
app.use(express.json());

app.get('/workers',(req,res)=>{
    const sql="select *from workers";
    db.query(sql,(err,results)=>{
        if(err)
        {
            console.error(err)
            res.status(500).json({success:false});
        }else{
            res.json(results);
        }
    });
});
app.post('/workers',(req,res)=>{
    const {name, gender, daily_wage}=req.body;
    const sql=`insert into workers  (name,gender,daily_wage)
    values (?,?,?)`;
    db.query(sql,[name,gender,daily_wage],(err,result)=>{
        if(err)
        {
            console.error(err)
            res.status(500).json({success:false});
        }else{
            res.json({
            success: true,
            worker_id: result.insertId
        });
        }
    });
    
});

app.post('/attendance',(req,res)=>{
    const {worker_id,date,present}=req.body;
    const sql=`
    insert into attendance (worker_id,date,present)
    values (?,?,?)`;
    db.query(sql,[worker_id,date,present],(err)=>{
        if(err)
        {
            console.error(err);
            res.status(500).json({success:false});
        }
        else{
            res.json({success:true});
        }
    });
});

app.get('/report/monthly',(req,res)=>{
    const { month }=req.query;
    const sql=`select w.id,w.name,w.daily_wage,count(a.id) as days_present, (count(a.id) * w.daily_wage) as total_salary 
    from workers w left join attendance a on w.id=a.worker_id and a.present=true and date_format(a.date ,'%Y-%m') = ? 
    group by w.id `;
    db.query(sql,[month],(err,results)=>{
        if(err){
            console.error(err);
            res.status(500).json({success:false});

        }else{
            res.json(results);
        }
    })
})

app.listen(3000,()=>{
    console.log("Server running on port 3000");
});