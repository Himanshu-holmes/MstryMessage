import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import {z} from "zod";
import { usernameValidation } from "@/schemas/signupSchema";

const UsernameQuerySchema = z.object({
    username:usernameValidation
});

export async function GET(request:Request){
    if(request.method !== 'GET'){
       return Response.json({
            success:false,
            message:"Method not allowed"
        },{
            status:405
        })
    }
    await dbConnect();
    try {
        const {searchParams} = new URL(request.url);
        const queryParam = {
            username:searchParams.get("username")
        };

        // validate with zod
      const result =  UsernameQuerySchema.safeParse(queryParam)
      console.log(result)
      if(!result.success){
        const usernameError = result.error.format().username?._errors || [];
        return Response.json({
            success:false,
            message:usernameError ?.length > 0 ? usernameError.join(','): "Invalid query parameter"
        },{
            status:400
        })
      }
      const {username} = result.data;
     const existingVerifiedUser = await UserModel.findOne({
        username,isVerified:true
      });

      if(existingVerifiedUser){
        return Response.json({
            success:false,
            message:"Username is already taken"
        },{
            status:400
        })
      }

      return Response.json({
        success:true,
        message:"Username is available"
    },{
        status:200
    })
    } catch (err) {
        console.log("Error checking username",err);
        return Response.json({
            success:false,
            message:"Failed to check username"
        },{status:500})
    }
}