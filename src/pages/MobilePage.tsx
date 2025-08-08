import { useEffect, useState } from 'react'
import { db, Job, JobStatus } from '../services/db'
import PhotoUploader from '../components/PhotoUploader'

export default function MobilePage(){
  const [jobs, setJobs] = useState<Job[]>([])
  const today = new Date().toISOString().slice(0,10)
  useEffect(()=>{ db.jobs.list().then(js=> setJobs(js.filter(j=> j.scheduledAt?.slice(0,10)===today))) }, [today])

  function quickStatus(j: Job, to: JobStatus){ db.jobs.update(j.id, { status: to }).then(()=> setJobs(s=> s.map(x=>x.id===j.id?{...x,status:to}:x))) }

  return (
    <div className="space-y-3">
      <div className="text-xl font-semibold">Today</div>
      {jobs.map(j=> (
        <div key={j.id} className="card p-3 space-y-2">
          <div className="font-semibold">{j.jobNo}</div>
          <div className="flex gap-2 flex-wrap">
            {['In Progress','Completed'].map(s=> <button key={s} className="btn-secondary" onClick={()=>quickStatus(j, s as JobStatus)}>{s}</button>)}
          </div>
          <PhotoUploader photos={j.photos} setPhotos={(p)=>db.jobs.update(j.id, { photos: p }).then(()=> setJobs(s=> s.map(x=>x.id===j.id?{...x,photos:p}:x)))} />
        </div>
      ))}
    </div>
  )
}