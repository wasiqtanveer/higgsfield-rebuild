import MediaCard from "../MediaCard/MediaCard.jsx";
import "./JobCard.css";

/**
 * One generation, in whatever state it happens to be.
 *
 * The states carry most of the perceived quality of this product, so each gets
 * its own treatment rather than a shared spinner:
 *   queued      -- position in line, nothing moving yet
 *   generating  -- shimmer + a progress arc that eases out
 *   done        -- the result, poster-first, video on hover
 */
export default function JobCard({ job, onRetry }) {
  const pct = Math.round((job.progress ?? 0) * 100);

  if (job.status === "done") {
    return (
      <div className="job job--done">
        <MediaCard
          clip={{ ...job, author: null, model: job.modelName }}
          ratio={job.ratio?.replace(":", " / ") || "16 / 9"}
          showMeta={false}
        >
          <div className="job__overlay">
            <span className="job__chip">{job.modelName}</span>
            {/* Image jobs have no duration, so the second chip carries
                whatever actually describes the result. */}
            <span className="job__chip job__chip--dim">
              {job.ratio}
              {job.seconds ? ` · ${job.seconds}s` : job.resolution ? ` · ${job.resolution}` : ""}
            </span>
          </div>
        </MediaCard>
        <p className="job__prompt" title={job.prompt}>{job.prompt}</p>
      </div>
    );
  }

  return (
    <div className="job job--pending">
      <div
        className="job__frame"
        style={{ "--tint": job.tint, "--ratio": job.ratio?.replace(":", " / ") || "16 / 9" }}
        role="status"
        aria-live="polite"
      >
        <div className="job__shimmer" aria-hidden="true" />

        <div className="job__state">
          {job.status === "queued" ? (
            <>
              <span className="job__pulse" aria-hidden="true" />
              <span className="job__label">Queued</span>
            </>
          ) : (
            <>
              <svg className="job__ring" viewBox="0 0 40 40" aria-hidden="true">
                <circle className="job__ring-track" cx="20" cy="20" r="17" />
                <circle
                  className="job__ring-fill"
                  cx="20" cy="20" r="17"
                  style={{ strokeDashoffset: 106.8 - 106.8 * (job.progress ?? 0) }}
                />
              </svg>
              <span className="job__label">Generating · {pct}%</span>
            </>
          )}
        </div>
      </div>
      <p className="job__prompt" title={job.prompt}>{job.prompt}</p>
    </div>
  );
}
