import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { videoApi } from "../api/video";
import { Upload, X } from "lucide-react";
import toast from "react-hot-toast";

const EditVideo = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: videoData, isLoading } = useQuery({
    queryKey: ["video", videoId],
    queryFn: () => videoApi.getVideoById(videoId!),
    enabled: !!videoId,
  });

  const videoDetails = videoData?.data;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize form values when video data loads
  if (videoDetails && !isInitialized) {
    setTitle(videoDetails.title);
    setDescription(videoDetails.description);
    setThumbnailPreview(videoDetails.thumbnail);
    setIsInitialized(true);
  }

  const updateVideoMutation = useMutation({
    mutationFn: (formData: FormData) =>
      videoApi.updateVideo(videoId!, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["video", videoId] });
      queryClient.invalidateQueries({ queryKey: ["channelVideos"] });
      toast.success("Video updated successfully");
      navigate(`/video/${videoId}`);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to update video");
    },
  });

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Thumbnail must be less than 2MB");
        return;
      }
      setThumbnail(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    if (!description.trim()) {
      toast.error("Please enter a description");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    if (thumbnail) {
      formData.append("thumbnail", thumbnail);
    }

    updateVideoMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-2 border-blue-500/20 rounded-full"></div>
          <div className="w-20 h-20 border-t-2 border-blue-500 rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
      </div>
    );
  }

  if (!videoDetails) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/5">
            <X className="w-10 h-10 text-slate-500" />
          </div>
          <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Video not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-6 mb-12">
          <div className="w-16 h-16 bg-blue-600/10 rounded-3xl flex items-center justify-center border border-blue-500/20">
            <Upload className="w-8 h-8 text-blue-500" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              Edit Video
            </h1>
            <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-[10px]">
              Update your content details
            </p>
          </div>
        </div>

        <div className="glass rounded-[2.5rem] p-10 border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 blur-[120px] -mr-48 -mt-48"></div>
          
          <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Left Side: Inputs */}
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                    Video Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                    placeholder="Enter video title"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={8}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium resize-none"
                    placeholder="Enter video description"
                  />
                </div>
              </div>

              {/* Right Side: Thumbnail */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                  Thumbnail (Optional)
                </label>
                <div className="relative group h-full min-h-[300px]">
                  <div className="relative h-full rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl group">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center backdrop-blur-sm">
                      <label className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20 cursor-pointer mb-4">
                        <Upload className="w-8 h-8" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleThumbnailChange}
                          className="hidden"
                          aria-label="Upload new thumbnail"
                        />
                      </label>
                      <p className="text-white font-black uppercase tracking-widest text-[10px]">Change Thumbnail</p>
                      {thumbnail && (
                        <button
                          type="button"
                          onClick={() => {
                            setThumbnail(null);
                            setThumbnailPreview(videoDetails.thumbnail);
                          }}
                          className="mt-4 text-red-500 font-black uppercase tracking-widest text-[10px] hover:text-red-400 transition-colors"
                        >
                          Reset to Original
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="submit"
                disabled={updateVideoMutation.isPending}
                className="flex-1 py-5 bg-blue-600 text-white rounded-[2rem] hover:bg-blue-500 disabled:opacity-50 transition-all duration-300 font-black uppercase tracking-widest text-sm shadow-xl shadow-blue-500/20 active:scale-[0.98] flex items-center justify-center gap-3"
              >
                {updateVideoMutation.isPending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Updating...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/video/${videoId}`)}
                className="flex-1 py-5 bg-white/5 text-white rounded-[2rem] hover:bg-white/10 transition-all duration-300 font-black uppercase tracking-widest text-sm border border-white/10 active:scale-[0.98]"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditVideo;
