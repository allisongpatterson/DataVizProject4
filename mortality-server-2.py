#
# A simple server for mortality data
#
# Requires the bottle framework
# (sufficient to have bottle.py in the same folder)
#
# run with:
#
#    python mortality-server-2.py 8080
#
# You can use any legal port number instead of 8080
# of course
#


from bottle import route, get, post, run, request, static_file, redirect, template
import os
import sys
import sqlite3

import traceback

from bottle import response
from json import dumps


MORTALITYDB = "mortality.db"



def pullDataQ1 ():
    conn = sqlite3.connect(MORTALITYDB)
    cur = conn.cursor()

    try: 
     
        #####For each cause of death in the Cause_Recode_39 column, 
        #####the average age of the persons that died from that cause, 
        #####for each year.

        cur.execute("""SELECT Cause_Recode_39, AVG(Age_Value), year
                        FROM mortality 
                        GROUP BY Cause_Recode_39, year;""")
        data_avg_age= [{"cause": int(cause),
                        "average_age": int(age),
                        "year": int(year)} for (cause, age, year) in cur.fetchall()]
        

        cur.execute("""SELECT s.age_value, s.year, Cause_Recode_39, max(s.occur) 
                    FROM 
                    (SELECT age_value, Cause_Recode_39,count(*) as occur, year 
                    FROM mortality GROUP BY age_value, year, Cause_Recode_39) 
                    AS s GROUP BY s.age_value, year;""")
        data_death_age=[{"age": int(age),
                        "year": int(year),
                        "cause": int(cause)} for (age, year, cause,number) in cur.fetchall()]

        conn.close()


        return   {"data_avg_age":data_avg_age, "data_death_age": data_death_age}
        

    except: 
        print "ERROR!!!"
        conn.close()
        raise




def pullDataQ2 ():
    conn = sqlite3.connect(MORTALITYDB)
    cur = conn.cursor()

    try: 

        #select Month_Of_Death, count(Month_Of_Death),year, Cause_Recode_39 from mortality group by Cause_Recode_39, Month_Of_Death, year order by Month_Of_Death;
        cur.execute("""SELECT Month_Of_Death, count(Month_Of_Death),Cause_Recode_39, year, age_value
            FROM mortality 
            GROUP BY Cause_Recode_39, Month_Of_Death, year, age_value
            ORDER BY Month_Of_Death;""")

        data = [{"month":int(month[1:]),
                 "number":int(number),
                 "cause": int(cause),
                 "year":int(year),
                 "age": int(age)} for (month, number, cause, year,age,) in  cur.fetchall()]
       
        conn.close()

        month = list(set([int(r["month"]) for r in data]))
        year = list(set([r["year"] for r in data]))
        cause = list(set([r["cause"] for r in data]))
      
        return {"data":data, "month":month, "year":year, "causes":cause}

    except: 
        print "ERROR!!!"
        conn.close()
        raise

        
# # get all data
# @get('/data')
# def data ():
#     data = pullDataQ2()
#     return template('project4.html',{'data': data})
#    # return pullDataQ2()

@get("/data")
def data ():
    return pullDataQ2()

@get("/test")
def test ():
    mass=pullDataQ1()
    return template('data.html',{'firstq':mass["data_avg_age"],'secondq':mass['data_death_age']})

    
@get('/<name>')
def static (name="index.html"):
    return static_file(name, root='.')  # os.getcwd())


def main (p):
    run(host='0.0.0.0', port=p)


if __name__ == "__main__":
    if len(sys.argv) > 1:
        main(int(sys.argv[1]))
    else:
        print "Usage: server <port>"
