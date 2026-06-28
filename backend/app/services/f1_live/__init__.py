"""
F1 Live module — ported SignalR pipeline + LiveManager + replay helper.

Exposed surface:
  from app.services.f1_live import manager          # LiveManager singleton
  from app.services.f1_live.signalr_client import F1LiveClient
  from app.services.f1_live.merger import StateStore, deep_merge
  from app.services.f1_live.decompressor import decompress_z_data
  from app.services.f1_live.topics import FREE_TOPICS, ALL_TOPICS, TOPICS
"""
