import { useState, type FormEvent } from "react";
import { videoApi } from "../api/video";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Upload, Loader2, X } from "lucide-react";
import toast from "react-hot-toast";

const UploadVideo = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const uploadMutation = useMutation({
    mutationFn: (data: FormData) => videoApi.publishVideo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      toast.success("Video uploaded successfully!");
      navigate("/dashboard");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Upload failed");
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!videoFile || !thumbnail) {
      toast.error("Please select both video and thumbnail");
      return;
    }

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("videoFile", videoFile);
    data.append("thumbnail", thumbnail);

    uploadMutation.mutate(data);
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-red-600/10 rounded-2xl flex items-center justify-center border border-red-500/20">
            <Upload className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Upload Video
            </h1>
            <p className="text-slate-500 font-bold mt-1 uppercase tracking-widest text-[10px]">
              Share your content with the world
            </p>
          </div>
        </div>

        <div className="glass rounded-[2.5rem] p-10 border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/5 blur-[120px] -mr-48 -mt-48"></div>
          
          <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Video Upload */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                  Video File <span className="text-red-500">*</span>
                </label>
                <div className="relative group h-64">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="video-upload"
                  />
                  <label
                    htmlFor="video-upload"
                    className={`flex flex-col items-center justify-center h-full rounded-[2.5rem] border-2 border-dashed transition-all duration-500 cursor-pointer ${
                      videoFile 
                        ? "border-red-500/50 bg-red-500/5" 
                        : "border-white/10 bg-white/5 hover:border-red-500/30 hover:bg-white/10"
                    }`}
                  >
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500 ${
                      videoFile ? "bg-red-500 text-white" : "bg-white/5 text-slate-500 group-hover:scale-110"
                    }`}>
                      <Upload className="w-8 h-8" />
                    </div>
                    {videoFile ? (
                      <div className="text-center px-6">
                        <p className="text-white font-bold truncate max-w-[200px]">{videoFile.name}</p>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2">Click to change</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-white font-black uppercase tracking-widest text-xs">Select Video</p>
                        <p className="text-slate-500 text-[10px] font-bold mt-1">MP4, WebM, or OGG</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Thumbnail Upload */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                  Thumbnail <span className="text-red-500">*</span>
                </label>
                <div className="relative group h-64">
                  {thumbnailPreview ? (
                    <div className="relative h-full rounded-[2.5rem] overflow-hidden group">
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail preview"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center backdrop-blur-sm">
                        <button
                          type="button"
                          onClick={() => {
                            setThumbnail(null);
                            setThumbnailPreview("");
                          }}
                          className="w-12 h-12 bg-red-600 text-white rounded-2xl flex items-center justify-center hover:bg-red-500 transition-all shadow-xl shadow-red-500/20"
                          aria-label="Remove thumbnail"
                        >
                          <X className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailChange}
                        className="hidden"
                        id="thumbnail-upload"
                      />
                      <label
                        htmlFor="thumbnail-upload"
                        className="flex flex-col items-center justify-center h-full rounded-[2.5rem] border-2 border-dashed border-white/10 bg-white/5 hover:border-red-500/30 hover:bg-white/10 transition-all duration-500 cursor-pointer"
                      >
                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 text-slate-500 group-hover:scale-110 transition-all duration-500">
                          <Upload className="w-8 h-8" />
                        </div>
                        <div className="text-center">
                          <p className="text-white font-black uppercase tracking-widest text-xs">Select Thumbnail</p>
                          <p className="text-slate-500 text-[10px] font-bold mt-1">JPG, PNG, or WebP</p>
                        </div>
                      </label>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                  Video Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all font-medium"
                  placeholder="Enter a catchy title"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={5}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all font-medium resize-none"
                  placeholder="Tell viewers about your video"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={uploadMutation.isPending}
              className="w-full py-5 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-[2rem] hover:from-red-600 hover:to-orange-600 disabled:opacity-50 transition-all duration-300 font-black uppercase tracking-widest text-sm shadow-xl shadow-red-500/20 active:scale-[0.98] flex items-center justify-center gap-3"
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  Uploading Content...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Publish Video
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadVideo;
