export interface RecordingStateChangeEvent<
  T extends keyof DetailDict,
  K = DetailDict[T],
> {
  version: string;
  id: string;
  'detail-type': T;
  source: string; // "aws.ivs"
  account: string;
  time: Date;
  region: string;
  resources: string[];
  detail: K;
}

type DetailDict = {
  'IVS Recording State Change': RecordingDetail;
  'IVS Stream State': StreamDetail;
};

type recordingStatus =
  | 'Recording Start'
  | 'Recording End'
  | 'Recording Start Failure'
  | 'Recording End Failure';

export interface RecordingDetail {
  channel_name: string;
  stream_id: string;
  recording_status: recordingStatus;
  recording_status_reason: string;
  recording_s3_bucket_name: string;
  recording_s3_key_prefix: string;
  recording_duration_ms: number;
}

type StreamEventName = 'Stream Start' | 'Stream End' | 'Stream Failure';

export interface StreamDetail {
  event_name: StreamEventName;
  channel_name: string;
  stream_id: string;
  reason: string;
}
