const express = require('express');
const cors = require('cors');
const db=require('./db');

const app=express();
app.use(cors());//enable cors(cross origin resource sharing)
app.use(express.json());

//display worker
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

//aadd worker
app.post('/workers',(req,res)=>{
    const {name, daily_wage}=req.body;
    const sql=`insert into workers  (name, daily_wage)
    values (?,?)`;
    db.query(sql,[name,daily_wage],(err,result)=>{
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

//add attendance
app.post('/attendance',(req,res)=>{
    const {worker_id,date,present}=req.body;
    const sql=`
    insert into attendance (worker_id,date,present)
    values (?,?,?)
    on duplicate key update present = ?`;
    db.query(sql,[worker_id,date,present,present],(err)=>{
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

//monthly report
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

//display workers
app.get('/attendance',(req,res)=>{
    const {date} = req.query;
    const sql=`select worker_id, present from attendance where \`date\` = ?`;

    db.query(sql,[date],(err,results)=>{
        if(err){
            console.error("Attandance get wror:",err);
            return res.status(500).json({success:false});
        }else{
            res.json(results);
        }
    });
});

//edit worker
app.put("/workers/:id", (req, res) => {
  const { id } = req.params;
  const { name, daily_wage } = req.body;

  const sql = `
    UPDATE workers
    SET name = ?, daily_wage = ?
    WHERE id = ?
  `;

  db.query(sql, [name, daily_wage, id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "DB update failed" });
    }

    res.json({ message: "Worker updated successfully" });
  });
});

//delete worker
app.delete('/workers/:id',(req,res)=>{
    const {id}=req.params;
    const sql="DELETE FROM workers where id = ?"
    db.query(sql,[id],(err)=>{
        if(err)
        {
            console.error(err);
            return res.status(500).json({success:false});
        }
        res.json({success:true});
    });
});

//add payment
app.post('/payments',(req,res)=>{
    const {worker_id,amount,payment_date,remarks}=req.body;
    const sql = `insert into payments (worker_id,amount,payment_date,remarks) values (?,?,?,?)`;

    db.query(sql,[worker_id,amount,payment_date,remarks],(err)=>{
        if(err){
            console.error(err);
            return res.status(500).json({success:false});

        }
            res.json({success:true});
        
    });
});

//display payments
app.get('/payments',(req,res)=>{
    const sql=`select p.id, w.name, p.amount, p.payment_date, p.remarks 
    from payments p join workers w on p.worker_id=w.id 
    order by p.payment_date desc;`//match payment with worker who received it, arrange newest first
    db.query(sql,(err,results)=>{
        if(err){
            console.error(err);
            return res.status(500).json({success:false});

        }
            res.json(results);
        
    });
});

app.listen(3000,()=>{
    console.log("Server running on port 3000");
});
