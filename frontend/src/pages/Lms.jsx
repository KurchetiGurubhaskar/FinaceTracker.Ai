import React, { useEffect, useState } from 'react';
import { BookOpen, PlayCircle, CheckCircle2, Award, Shield, Loader2, Star } from 'lucide-react';
import api from '../api/axios';

export function Lms() {
  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coursesRes, progressRes] = await Promise.all([
        api.get('lms/courses/'),
        api.get('lms/progress/')
      ]);
      setCourses(coursesRes.data);
      // Usually progress is one per user
      if (progressRes.data.length > 0) {
        setProgress(progressRes.data[0]);
      } else {
        // Create initial progress if none exists
        const newProgress = await api.post('lms/progress/', { total_xp: 0, level: 1, completed_videos: [] });
        setProgress(newProgress.data);
      }
    } catch (error) {
      console.error('Failed to fetch LMS data:', error);
    } finally {
      setLoading(false);
    }
  };

  const markVideoComplete = async (video) => {
    if (!progress || progress.completed_videos.includes(video.id)) return;
    
    try {
      const updatedVideos = [...progress.completed_videos, video.id];
      const res = await api.patch(`lms/progress/${progress.id}/`, {
        completed_videos: updatedVideos
      });
      // The backend should calculate the level and XP, but if not we might need to refresh
      fetchData(); 
      setActiveVideo(null); // Close modal
    } catch (error) {
      console.error('Failed to complete video:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const level = progress?.level || 1;
  const xp = progress?.total_xp || 0;
  const nextLevelXp = level * 100;
  const xpProgress = Math.min((xp / nextLevelXp) * 100, 100);

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 mt-6 relative">
      {/* Top Gamification Bar */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 rounded-2xl p-6 shadow-xl text-white flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
        
        <div className="flex items-center gap-6 z-10">
          <div className="relative">
            <div className="w-20 h-20 bg-indigo-800 rounded-full border-4 border-indigo-400 flex items-center justify-center shadow-lg">
              <Shield className="w-10 h-10 text-yellow-400" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-950 text-xs font-black px-3 py-1 rounded-full shadow-md">
              LVL {level}
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">Financial Academy</h1>
            <p className="text-indigo-200 font-medium mt-1">Master your money. Level up your life.</p>
          </div>
        </div>

        <div className="w-full md:w-72 bg-indigo-950/50 rounded-xl p-4 border border-indigo-500/30 z-10">
          <div className="flex justify-between text-sm font-bold text-indigo-100 mb-2">
            <span>Current XP</span>
            <span className="text-yellow-400">{xp} / {nextLevelXp}</span>
          </div>
          <div className="h-3 bg-indigo-950 rounded-full overflow-hidden border border-indigo-800">
            <div className="h-full bg-gradient-to-r from-yellow-500 to-yellow-300 transition-all duration-1000 ease-out" style={{ width: `${xpProgress}%` }}></div>
          </div>
          <p className="text-xs text-indigo-300 font-medium mt-2 text-right">
            {nextLevelXp - xp} XP to next level
          </p>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-indigo-600" /> Available Courses
        </h2>
        
        {courses.length === 0 ? (
          <div className="bg-white border border-slate-200 border-dashed rounded-xl p-12 text-center text-slate-500">
            No courses available yet. Check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {courses.map(course => {
              const totalVideos = course.videos.length;
              const completedVideosCount = course.videos.filter((v) => progress?.completed_videos.includes(v.id)).length;
              const isCompleted = totalVideos > 0 && completedVideosCount === totalVideos;
              const courseProgress = totalVideos > 0 ? (completedVideosCount / totalVideos) * 100 : 0;

              return (
                <div key={course.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                  <div className="h-40 bg-slate-100 relative group overflow-hidden">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-indigo-50 flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-indigo-200" />
                      </div>
                    )}
                    {isCompleted && (
                      <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center backdrop-blur-sm">
                        <div className="bg-white text-emerald-600 font-black px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5" /> MASTERED
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="font-bold text-slate-900 text-lg mb-2">{course.title}</h3>
                    <p className="text-sm text-slate-500 mb-6 line-clamp-2 flex-1">{course.description}</p>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span className="text-slate-600">Progress</span>
                          <span className={isCompleted ? 'text-emerald-600' : 'text-indigo-600'}>{courseProgress.toFixed(0)}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full ${isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${courseProgress}%` }}></div>
                        </div>
                      </div>

                      <div className="border-t border-slate-100 pt-4 space-y-2">
                        {course.videos.map((video) => {
                          const isVidCompleted = progress?.completed_videos.includes(video.id);
                          return (
                            <button 
                              key={video.id}
                              onClick={() => setActiveVideo(video)}
                              className="w-full flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors group"
                            >
                              <div className="flex items-center gap-3">
                                {isVidCompleted ? (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                ) : (
                                  <PlayCircle className="w-5 h-5 text-indigo-400 group-hover:text-indigo-600" />
                                )}
                                <span className={`text-sm font-medium ${isVidCompleted ? 'text-slate-500 line-through' : 'text-slate-700'}`}>
                                  {video.title}
                                </span>
                              </div>
                              <span className="text-xs font-bold text-yellow-500 flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-md border border-yellow-200">
                                <Star className="w-3 h-3 fill-yellow-500" /> {video.xp_reward}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Video Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setActiveVideo(null)}></div>
          <div className="bg-white rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-full">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900 text-lg">{activeVideo.title}</h3>
              <button onClick={() => setActiveVideo(null)} className="text-slate-400 hover:text-slate-600 font-bold p-2">✕</button>
            </div>
            
            <div className="aspect-video bg-black relative flex items-center justify-center">
              {activeVideo.video_url.includes('youtube') || activeVideo.video_url.includes('vimeo') ? (
                <iframe 
                  src={activeVideo.video_url.replace('watch?v=', 'embed/')} 
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="text-white text-center">
                  <PlayCircle className="w-16 h-16 opacity-50 mx-auto mb-4" />
                  <p>Video Player (Mock)</p>
                  <a href={activeVideo.video_url} target="_blank" rel="noreferrer" className="text-indigo-400 underline text-sm mt-2 block">Open Link</a>
                </div>
              )}
            </div>

            <div className="p-6 bg-white flex justify-between items-center">
              <div>
                <p className="text-slate-500 text-sm font-medium">Earn <span className="font-bold text-yellow-500">{activeVideo.xp_reward} XP</span> upon completion.</p>
              </div>
              <button 
                onClick={() => markVideoComplete(activeVideo)}
                disabled={progress?.completed_videos.includes(activeVideo.id)}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-200 transition-all active:scale-95"
              >
                {progress?.completed_videos.includes(activeVideo.id) ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" /> Completed
                  </>
                ) : (
                  <>
                    <Award className="w-5 h-5" /> Mark as Complete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
