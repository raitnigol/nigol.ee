import { spotifyClientRunner } from "./spotifyHttp";

export const withSpotifyUserClient = spotifyClientRunner("refresh_token");
