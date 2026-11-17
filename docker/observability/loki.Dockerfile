# The image of the loki has no shell and no download tool, so its container health check
# (OBS-F-5, SCF-F-20) cannot run in it. This file adds one static tool, busybox, and nothing else.
# Both base images are pinned and scanned by the job container-scan (SCF-AC-5.2).
FROM busybox:1.38.0-musl AS tools
FROM grafana/loki:3.7.9
COPY --from=tools --chmod=0755 /bin/busybox /busybox
