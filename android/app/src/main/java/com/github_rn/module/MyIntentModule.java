package com.github_rn.module;


import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Log;
import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.core.content.FileProvider;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import java.io.File;


public class MyIntentModule extends ReactContextBaseJavaModule {

    private static final String IMAGE_ROOT_PATH = Environment.getExternalStorageDirectory().getAbsolutePath() + "/faces/";
    private static final int CAMERA_CODE = 0;
    private static final int ALBUM_CODE = 1;
    private static final int REQUEST_CODE_CROP = 2;
    private static final int OPEN_CAMERA = 3;
    private Promise mPromise = null;
    private Uri mUri = null;
    private String mFileName = null;
    private ReactApplicationContext reactContext;
    private Intent mIntent;
    private Activity currentActivity;
    private static String[] PERMISSIONS_STORAGE = {
            "android.permission.CAMERA",
            "android.permission.READ_EXTERNAL_STORAGE",
            "android.permission.WRITE_EXTERNAL_STORAGE"};//权限

    public MyIntentModule(@NonNull ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        initActivityEventListener();
    }

    @NonNull
    @Override
    public String getName() {
        return "AlbumModule";
    }

    private void initActivityEventListener() {
        reactContext.addActivityEventListener(new BaseActivityEventListener() {
            @Override
            public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
                if (requestCode == CAMERA_CODE) {
                    if (resultCode == Activity.RESULT_OK) {
                        mPromise.resolve(IMAGE_ROOT_PATH + mFileName);
                    } else if (resultCode == Activity.RESULT_CANCELED) {
                        mPromise.resolve(null);
                    }
                } else if (requestCode == ALBUM_CODE) {
                    if (resultCode == Activity.RESULT_OK) {
                        try {
                            Uri selectedImage = data.getData(); //获取系统返回的照片的Uri
                            String[] filePathColumn = {MediaStore.Images.Media.DATA};
                            Cursor cursor = reactContext.getContentResolver().query(selectedImage,
                                    filePathColumn, null, null, null);//从系统表中查询指定Uri对应的照片
                            cursor.moveToFirst();
                            int columnIndex = cursor.getColumnIndex(filePathColumn[0]);
                            String path = cursor.getString(columnIndex);  //获取照片路径
                            cursor.close();
                            Log.i("callCamera", "path:" + path);
                            mPromise.resolve(path);
                        } catch (Exception e) {
                            // TODO Auto-generatedcatch block
                            e.printStackTrace();
                            mPromise.resolve(null);
                        }
                    } else if (resultCode == Activity.RESULT_CANCELED) {
                        mPromise.resolve(null);
                    }
                }
            }

        });
    }


    /**
     * 拍照方法，提供给js调用的方法
     * @param promise 返回拍照结果给js需要使用
     */
    @ReactMethod
    public void openCamera(Promise promise) {
        //安卓6.0以上需要动态申请权限
        if (hasPermission()) {
            mPromise = promise;
            takePhoto();
        }
    }

    /**
     * 打开相册选择照片
     * @param promise
     */
    @ReactMethod
    public void chooseAlbum(Promise promise) {
        if (hasPermission()) {//申请权限
            mPromise = promise;
            Intent intent = new Intent(Intent.ACTION_PICK, android.provider.MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
            currentActivity.startActivityForResult(intent, ALBUM_CODE);

        }
    }

    private boolean hasPermission() {
        currentActivity = getCurrentActivity();
        //安卓6.0以上动态权限申请
        if (Build.VERSION.SDK_INT >= 23) {
            int checkCallPhonePermission = ContextCompat.checkSelfPermission(reactContext, Manifest.permission.CAMERA);
            if (checkCallPhonePermission != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(currentActivity, PERMISSIONS_STORAGE, OPEN_CAMERA);
                return false;
            } else {
                return true;
            }
        } else {
            return true;
        }
    }

    private void takePhoto() {
        mIntent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
        File faceDir = getImageDir();
        if (faceDir != null) {
            mFileName = System.currentTimeMillis() + ".jpg";
            File file = new File(faceDir, mFileName);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                //设置7.0以上共享文件，分享路径定义在xml/file_paths.xml
                mUri = FileProvider.getUriForFile(reactContext, "com.github_rn.fileprovider", file);
            } else {
                // 7.0以下,共享文件
                mUri = Uri.fromFile(file);
            }
            mIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            mIntent.addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
            mIntent.setAction(MediaStore.ACTION_IMAGE_CAPTURE);
            mIntent.putExtra(MediaStore.EXTRA_OUTPUT, mUri);
            currentActivity.startActivityForResult(mIntent, CAMERA_CODE);
        }
    }

    private File getImageDir() {
        File file = new File(IMAGE_ROOT_PATH);
        if (!file.exists()) {
            boolean idSuccess = file.mkdirs();
            Log.i("callCamera", "idSuccess:" + idSuccess);
        }
        return file;
    }
}
