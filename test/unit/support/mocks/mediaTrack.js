export const mediaTrack = () => {
  return {
    stop: () => {
      console.log("Stop called from mediaTrack()");
    }
  };
};

export const mediaTrackThrowsError = () => {
  return {
    stop: () => {
      console.log("Stop called from mediaTrackThrowsError()");
      throw new Error("");
    }
  };
};
