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


from bottle import get, post, run, request, static_file, redirect
import os
import sys
import sqlite3

import traceback

from bottle import response
from json import dumps


MORTALITYDB = "mortality.db"



def pullData ():
    conn = sqlite3.connect(MORTALITYDB)
    cur = conn.cursor()

    try: 
        cur.execute("""SELECT year, Cause_Recode_39, sex, age_value, SUM(1) as total 
                       FROM mortality
                       GROUP BY year, Cause_Recode_39, sex;""")
        data = [{"year":int(year),
                 "cause":int(cause),
                 "gender":sex,
                 "age":int(age),
                 "total":total} for (year, cause, sex, age, total,) in  cur.fetchall()]
       
        #####For each cause of death in the Cause_Recode_39 column, 
        #####the average age of the persons that died from that cause, 
        #####for each year.

        # cur.execute("""SELECT Cause_Recode_39, AVG(Age_Value) 
        #                 FROM mortality 
        #                 GROUP BY Cause_Recode_39;""")
        # data_avg_age= [{"cause": int(cause),
        #                 "average_age": int(age)} for (cause, age) in cur.fetchall()]
        


        #####For each age, the top cause of death (as per the Cause_Record_39)
        #####for deaths at that age, for each year.


#karina: what is this for? 
        causes = list(set([int(r["cause"]) for r in data]))
#        genders = list(set([r["gender"] for r in data]))

        averages= {}
        for i in data:  #keeps track of how many and total to find average later
            if (i['cause'] not in averages):
                averages[i['cause']]=(i['age'],1)
            else:
                agetuple= averages[i['cause']]
                agetuple= (agetuple[0]+i['age'],agetuple[1]+1)
                averages[i['cause']]=agetuple
        for a in averages.keys():
            average = averages[a][0]/averages[a][1]
            averages[a]=average
        



        conn.close()


        return   {"data":data, "average": averages}
        #{"data_avg_age":data_avg_age}
        #{"data":data, 
              
               # "data_top_cause":data_top_cause}
               # "genders":genders,
              #  "causes":causes}

    except: 
        print "ERROR!!!"
        conn.close()
        raise


        
# get all data
    
@get("/data")
def data ():
    return pullData()

    
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
