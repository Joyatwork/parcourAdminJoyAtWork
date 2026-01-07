<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserChallengeController extends Controller
{
    public function lenghParticipantsParDefi($id)
    {   
        $challengeUsers = ChallengeUser::where('challenge_id', $id)->get();

        return response()->json($challengeUsers);
    }
}
